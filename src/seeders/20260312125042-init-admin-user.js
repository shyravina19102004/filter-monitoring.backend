'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Получаем ID роли admin
    const adminRole = await queryInterface.rawSelect(
      'roles',
      { where: { name: 'admin' } },
      ['id']
    );

    if (!adminRole) {
      console.log('Роль admin не найдена, пропускаем создание пользователя');
      return;
    }

    const passwordHash = await bcrypt.hash('admin123', 10); // Пароль по умолчанию

    await queryInterface.bulkInsert(
      'users',
      [
        {
          email: 'admin@example.com',
          passwordHash,
          fullName: 'Администратор Системы',
          roleId: adminRole,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { email: 'admin@example.com' }, {});
  },
};