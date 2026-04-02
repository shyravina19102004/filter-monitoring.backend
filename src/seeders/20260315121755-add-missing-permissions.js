'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Получаем уже существующие разрешения, чтобы не дублировать
    const existingPermissions = await queryInterface.sequelize.query(
      'SELECT name FROM permissions',
      { type: Sequelize.QueryTypes.SELECT }
    );
    const existingNames = existingPermissions.map(p => p.name);

    // 2. Список всех недостающих разрешений (которых нет в existingNames)
    const newPermissions = [
      // Роли
      { name: 'roles:read', resource: 'roles', action: 'read', createdAt: new Date(), updatedAt: new Date() },
      { name: 'roles:create', resource: 'roles', action: 'create', createdAt: new Date(), updatedAt: new Date() },
      { name: 'roles:update', resource: 'roles', action: 'update', createdAt: new Date(), updatedAt: new Date() },
      { name: 'roles:delete', resource: 'roles', action: 'delete', createdAt: new Date(), updatedAt: new Date() },
      // Типы локаций
      { name: 'location-types:read', resource: 'location-types', action: 'read', createdAt: new Date(), updatedAt: new Date() },
      { name: 'location-types:create', resource: 'location-types', action: 'create', createdAt: new Date(), updatedAt: new Date() },
      { name: 'location-types:update', resource: 'location-types', action: 'update', createdAt: new Date(), updatedAt: new Date() },
      { name: 'location-types:delete', resource: 'location-types', action: 'delete', createdAt: new Date(), updatedAt: new Date() },
      // Производители
      { name: 'manufacturers:read', resource: 'manufacturers', action: 'read', createdAt: new Date(), updatedAt: new Date() },
      { name: 'manufacturers:create', resource: 'manufacturers', action: 'create', createdAt: new Date(), updatedAt: new Date() },
      { name: 'manufacturers:update', resource: 'manufacturers', action: 'update', createdAt: new Date(), updatedAt: new Date() },
      { name: 'manufacturers:delete', resource: 'manufacturers', action: 'delete', createdAt: new Date(), updatedAt: new Date() },
      // Типы фильтров
      { name: 'filter-types:read', resource: 'filter-types', action: 'read', createdAt: new Date(), updatedAt: new Date() },
      { name: 'filter-types:create', resource: 'filter-types', action: 'create', createdAt: new Date(), updatedAt: new Date() },
      { name: 'filter-types:update', resource: 'filter-types', action: 'update', createdAt: new Date(), updatedAt: new Date() },
      { name: 'filter-types:delete', resource: 'filter-types', action: 'delete', createdAt: new Date(), updatedAt: new Date() },
      // Единицы измерения
      { name: 'units:read', resource: 'units', action: 'read', createdAt: new Date(), updatedAt: new Date() },
      { name: 'units:create', resource: 'units', action: 'create', createdAt: new Date(), updatedAt: new Date() },
      { name: 'units:update', resource: 'units', action: 'update', createdAt: new Date(), updatedAt: new Date() },
      { name: 'units:delete', resource: 'units', action: 'delete', createdAt: new Date(), updatedAt: new Date() },
      // Конфигурация уведомлений
      { name: 'notification-configs:read', resource: 'notification-configs', action: 'read', createdAt: new Date(), updatedAt: new Date() },
      { name: 'notification-configs:create', resource: 'notification-configs', action: 'create', createdAt: new Date(), updatedAt: new Date() },
      { name: 'notification-configs:update', resource: 'notification-configs', action: 'update', createdAt: new Date(), updatedAt: new Date() },
      { name: 'notification-configs:delete', resource: 'notification-configs', action: 'delete', createdAt: new Date(), updatedAt: new Date() },
      // Шаблоны документов
      { name: 'document-templates:read', resource: 'document-templates', action: 'read', createdAt: new Date(), updatedAt: new Date() },
      { name: 'document-templates:create', resource: 'document-templates', action: 'create', createdAt: new Date(), updatedAt: new Date() },
      { name: 'document-templates:update', resource: 'document-templates', action: 'update', createdAt: new Date(), updatedAt: new Date() },
      { name: 'document-templates:delete', resource: 'document-templates', action: 'delete', createdAt: new Date(), updatedAt: new Date() },
      // Логи (добавляем delete)
      { name: 'logs:delete', resource: 'logs', action: 'delete', createdAt: new Date(), updatedAt: new Date() },
    ];

    // Фильтруем: оставляем только те, которых ещё нет
    const permissionsToInsert = newPermissions.filter(p => !existingNames.includes(p.name));

    if (permissionsToInsert.length === 0) {
      console.log('Все необходимые разрешения уже существуют.');
      return;
    }

    // Вставляем новые разрешения
    await queryInterface.bulkInsert('permissions', permissionsToInsert);

    // 3. Получаем ID вставленных разрешений (чтобы знать их id для связей)
    const insertedPermissions = await queryInterface.sequelize.query(
      'SELECT id, name FROM permissions WHERE name IN (:names)',
      {
        replacements: { names: permissionsToInsert.map(p => p.name) },
        type: Sequelize.QueryTypes.SELECT
      }
    );
    const permissionMap = {};
    insertedPermissions.forEach(p => { permissionMap[p.name] = p.id; });

    // 4. Получаем ID ролей
    const roles = await queryInterface.sequelize.query(
      'SELECT id, name FROM roles',
      { type: Sequelize.QueryTypes.SELECT }
    );
    const roleMap = {};
    roles.forEach(r => { roleMap[r.name] = r.id; });

    // 5. Формируем связи role_permissions

    const rolePermissions = [];

    // --- Админ: все новые разрешения ---
    if (roleMap['admin']) {
      Object.values(permissionMap).forEach(permId => {
        rolePermissions.push({
          roleId: roleMap['admin'],
          permissionId: permId,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });
    }

    // --- Супервайзер: только чтение (action = 'read') ---
    if (roleMap['supervisor']) {
      permissionsToInsert.forEach(p => {
        if (p.action === 'read') {
          rolePermissions.push({
            roleId: roleMap['supervisor'],
            permissionId: permissionMap[p.name],
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      });
    }

    // --- Мастер: чтение, создание, обновление (всё кроме delete) ---
    if (roleMap['master']) {
      permissionsToInsert.forEach(p => {
        if (p.action === 'read' || p.action === 'create' || p.action === 'update') {
          rolePermissions.push({
            roleId: roleMap['master'],
            permissionId: permissionMap[p.name],
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      });
    }

    // --- Рабочий: только чтение для справочников (location-types, manufacturers, filter-types, units) ---
    if (roleMap['worker']) {
      const workerReadResources = ['location-types', 'manufacturers', 'filter-types', 'units'];
      permissionsToInsert.forEach(p => {
        if (p.action === 'read' && workerReadResources.includes(p.resource)) {
          rolePermissions.push({
            roleId: roleMap['worker'],
            permissionId: permissionMap[p.name],
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      });
    }

    // Вставляем связи, если они есть (уникальный индекс предотвратит дубликаты)
    if (rolePermissions.length > 0) {
      await queryInterface.bulkInsert('role_permissions', rolePermissions);
    }

    console.log(`Добавлено ${permissionsToInsert.length} новых разрешений и ${rolePermissions.length} связей с ролями.`);
  },

  async down(queryInterface, Sequelize) {
    // Список имён добавленных разрешений
    const newPermissionNames = [
      'roles:read', 'roles:create', 'roles:update', 'roles:delete',
      'location-types:read', 'location-types:create', 'location-types:update', 'location-types:delete',
      'manufacturers:read', 'manufacturers:create', 'manufacturers:update', 'manufacturers:delete',
      'filter-types:read', 'filter-types:create', 'filter-types:update', 'filter-types:delete',
      'units:read', 'units:create', 'units:update', 'units:delete',
      'notification-configs:read', 'notification-configs:create', 'notification-configs:update', 'notification-configs:delete',
      'document-templates:read', 'document-templates:create', 'document-templates:update', 'document-templates:delete',
      'logs:delete'
    ];

    // Удаляем связи, соответствующие этим разрешениям
    await queryInterface.sequelize.query(
      'DELETE FROM role_permissions WHERE "permissionId" IN (SELECT id FROM permissions WHERE name IN (:names))',
      { replacements: { names: newPermissionNames } }
    );

    // Удаляем сами разрешения
    await queryInterface.bulkDelete('permissions', { name: newPermissionNames });
  }
};