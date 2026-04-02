const { User, Role, sequelize } = require('../models');
const { QueryTypes } = require('sequelize');

/**
 * Возвращает массив id локаций, доступных пользователю.
 * Для admin и supervisor возвращает null (означает "все локации").
 * Для worker и master возвращает массив, включающий его locationId и всех потомков.
 */
async function getAccessibleLocationIds(user) {
  // Администратор и руководитель видят всё
  if (user.role.name === 'admin' || user.role.name === 'supervisor') {
    return null; // сигнал, что фильтр не нужен
  }

  // Если у пользователя нет locationId, он ничего не видит (кроме админов/руководителей)
  if (!user.locationId) {
    return [];
  }

  // Для worker и master получаем поддерево
  const query = `
    WITH RECURSIVE location_tree AS (
      SELECT id FROM locations WHERE id = :rootId
      UNION ALL
      SELECT l.id FROM locations l
      INNER JOIN location_tree lt ON lt.id = l."parentId"
    )
    SELECT id FROM location_tree;
  `;

  const result = await sequelize.query(query, {
    replacements: { rootId: user.locationId },
    type: QueryTypes.SELECT
  });

  return result.map(row => row.id);
}

/**
 * Добавляет условие фильтрации по locationId к уже построенному запросу Sequelize.
 * @param {Object} where - объект условий (можно передать по ссылке)
 * @param {Array|null} accessibleIds - результат getAccessibleLocationIds
 * @param {string} fieldName - имя поля, по которому фильтруем (по умолчанию 'locationId')
 */
function applyLocationFilter(where, accessibleIds, fieldName = 'locationId') {
  if (accessibleIds === null) {
    // null означает "без ограничений" – ничего не делаем
    return;
  }
  if (accessibleIds.length === 0) {
    // нет доступа ни к одной локации – добавляем невозможное условие
    where[fieldName] = null;
  } else {
    where[fieldName] = accessibleIds;
  }
}

/**
 * Возвращает массив ID пользователей с ролью master, ответственных за указанную локацию
 * (включая вышестоящие локации).
 * @param {number} locationId
 * @returns {Promise<number[]>}
 */
async function getResponsibleUsers(locationId) {
  if (!locationId) return [];

  // Рекурсивно находим всех родителей локации
  const query = `
    WITH RECURSIVE loc_parents AS (
      SELECT id, "parentId" FROM locations WHERE id = :locationId
      UNION ALL
      SELECT l.id, l."parentId" FROM locations l
      INNER JOIN loc_parents lp ON lp."parentId" = l.id
    )
    SELECT DISTINCT u.id FROM users u
    INNER JOIN roles r ON u."roleId" = r.id
    WHERE r.name = 'master'
      AND u."locationId" IN (SELECT id FROM loc_parents)
      AND u."isActive" = true;
  `;

  const result = await sequelize.query(query, {
    replacements: { locationId },
    type: QueryTypes.SELECT
  });

  return result.map(row => row.id);
}

module.exports = {
  getAccessibleLocationIds,
  applyLocationFilter,
  getResponsibleUsers
};