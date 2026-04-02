'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Вставляем роли
    const roles = await queryInterface.bulkInsert(
      'roles',
      [
        {
          name: 'admin',
          description: 'Администратор системы',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'supervisor',
          description: 'Руководитель производства',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'master',
          description: 'Мастер/начальник установки',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'worker',
          description: 'Рабочий/техник',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      { returning: true }
    );

    // 2. Вставляем разрешения
    const permissions = await queryInterface.bulkInsert(
      'permissions',
      [
        // Пользователи
        { name: 'users:read', resource: 'users', action: 'read', createdAt: new Date(), updatedAt: new Date() },
        { name: 'users:create', resource: 'users', action: 'create', createdAt: new Date(), updatedAt: new Date() },
        { name: 'users:update', resource: 'users', action: 'update', createdAt: new Date(), updatedAt: new Date() },
        { name: 'users:delete', resource: 'users', action: 'delete', createdAt: new Date(), updatedAt: new Date() },
        // Локации
        { name: 'locations:read', resource: 'locations', action: 'read', createdAt: new Date(), updatedAt: new Date() },
        { name: 'locations:create', resource: 'locations', action: 'create', createdAt: new Date(), updatedAt: new Date() },
        { name: 'locations:update', resource: 'locations', action: 'update', createdAt: new Date(), updatedAt: new Date() },
        { name: 'locations:delete', resource: 'locations', action: 'delete', createdAt: new Date(), updatedAt: new Date() },
        // Модели фильтров
        { name: 'filter-models:read', resource: 'filter-models', action: 'read', createdAt: new Date(), updatedAt: new Date() },
        { name: 'filter-models:create', resource: 'filter-models', action: 'create', createdAt: new Date(), updatedAt: new Date() },
        { name: 'filter-models:update', resource: 'filter-models', action: 'update', createdAt: new Date(), updatedAt: new Date() },
        { name: 'filter-models:delete', resource: 'filter-models', action: 'delete', createdAt: new Date(), updatedAt: new Date() },
        // Экземпляры фильтров
        { name: 'filter-instances:read', resource: 'filter-instances', action: 'read', createdAt: new Date(), updatedAt: new Date() },
        { name: 'filter-instances:create', resource: 'filter-instances', action: 'create', createdAt: new Date(), updatedAt: new Date() },
        { name: 'filter-instances:update', resource: 'filter-instances', action: 'update', createdAt: new Date(), updatedAt: new Date() },
        { name: 'filter-instances:delete', resource: 'filter-instances', action: 'delete', createdAt: new Date(), updatedAt: new Date() },
        // Корпуса фильтров
        { name: 'filter-housings:read', resource: 'filter-housings', action: 'read', createdAt: new Date(), updatedAt: new Date() },
        { name: 'filter-housings:create', resource: 'filter-housings', action: 'create', createdAt: new Date(), updatedAt: new Date() },
        { name: 'filter-housings:update', resource: 'filter-housings', action: 'update', createdAt: new Date(), updatedAt: new Date() },
        { name: 'filter-housings:delete', resource: 'filter-housings', action: 'delete', createdAt: new Date(), updatedAt: new Date() },
        // Счётчики
        { name: 'meters:read', resource: 'meters', action: 'read', createdAt: new Date(), updatedAt: new Date() },
        { name: 'meters:create', resource: 'meters', action: 'create', createdAt: new Date(), updatedAt: new Date() },
        { name: 'meters:update', resource: 'meters', action: 'update', createdAt: new Date(), updatedAt: new Date() },
        { name: 'meters:delete', resource: 'meters', action: 'delete', createdAt: new Date(), updatedAt: new Date() },
        // Показания
        { name: 'meter-readings:read', resource: 'meter-readings', action: 'read', createdAt: new Date(), updatedAt: new Date() },
        { name: 'meter-readings:create', resource: 'meter-readings', action: 'create', createdAt: new Date(), updatedAt: new Date() },
        { name: 'meter-readings:update', resource: 'meter-readings', action: 'update', createdAt: new Date(), updatedAt: new Date() },
        { name: 'meter-readings:delete', resource: 'meter-readings', action: 'delete', createdAt: new Date(), updatedAt: new Date() },
        // Правила
        { name: 'rules:read', resource: 'rules', action: 'read', createdAt: new Date(), updatedAt: new Date() },
        { name: 'rules:create', resource: 'rules', action: 'create', createdAt: new Date(), updatedAt: new Date() },
        { name: 'rules:update', resource: 'rules', action: 'update', createdAt: new Date(), updatedAt: new Date() },
        { name: 'rules:delete', resource: 'rules', action: 'delete', createdAt: new Date(), updatedAt: new Date() },
        // Установки
        { name: 'installations:read', resource: 'installations', action: 'read', createdAt: new Date(), updatedAt: new Date() },
        { name: 'installations:create', resource: 'installations', action: 'create', createdAt: new Date(), updatedAt: new Date() },
        { name: 'installations:update', resource: 'installations', action: 'update', createdAt: new Date(), updatedAt: new Date() },
        { name: 'installations:delete', resource: 'installations', action: 'delete', createdAt: new Date(), updatedAt: new Date() },
        // Оповещения
        { name: 'notifications:read', resource: 'notifications', action: 'read', createdAt: new Date(), updatedAt: new Date() },
        { name: 'notifications:update', resource: 'notifications', action: 'update', createdAt: new Date(), updatedAt: new Date() },
        // Акты
        { name: 'work-orders:read', resource: 'work-orders', action: 'read', createdAt: new Date(), updatedAt: new Date() },
        { name: 'work-orders:create', resource: 'work-orders', action: 'create', createdAt: new Date(), updatedAt: new Date() },
        { name: 'work-orders:update', resource: 'work-orders', action: 'update', createdAt: new Date(), updatedAt: new Date() },
        { name: 'work-orders:delete', resource: 'work-orders', action: 'delete', createdAt: new Date(), updatedAt: new Date() },
        // Отчёты
        { name: 'reports:read', resource: 'reports', action: 'read', createdAt: new Date(), updatedAt: new Date() },
        // Настройки
        { name: 'settings:read', resource: 'settings', action: 'read', createdAt: new Date(), updatedAt: new Date() },
        { name: 'settings:update', resource: 'settings', action: 'update', createdAt: new Date(), updatedAt: new Date() },
        // Логи
        { name: 'logs:read', resource: 'logs', action: 'read', createdAt: new Date(), updatedAt: new Date() },
      ],
      { returning: true }
    );

    // Получаем ID ролей для дальнейшего использования
    const adminRole = await queryInterface.rawSelect('roles', { where: { name: 'admin' } }, ['id']);
    const supervisorRole = await queryInterface.rawSelect('roles', { where: { name: 'supervisor' } }, ['id']);
    const masterRole = await queryInterface.rawSelect('roles', { where: { name: 'master' } }, ['id']);
    const workerRole = await queryInterface.rawSelect('roles', { where: { name: 'worker' } }, ['id']);

    // Получаем все разрешения с полями id и name
    const allPermissions = await queryInterface.sequelize.query(
      'SELECT id, name FROM permissions',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // 3. Назначаем администратору все разрешения
    const rolePermissionsAdmin = allPermissions.map(p => ({
      roleId: adminRole,
      permissionId: p.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    if (rolePermissionsAdmin.length > 0) {
      await queryInterface.bulkInsert('role_permissions', rolePermissionsAdmin);
    }

    // 4. Назначаем разрешения для supervisor (чтение всех ресурсов)
    const readPermissions = allPermissions.filter(p => p.name.endsWith(':read'));
    if (readPermissions.length > 0) {
      const supervisorPerms = readPermissions.map(p => ({
        roleId: supervisorRole,
        permissionId: p.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      await queryInterface.bulkInsert('role_permissions', supervisorPerms);
    }

    // 5. Разрешения для master (чтение + создание/изменение)
    const masterActions = ['read', 'create', 'update'];
    const masterPermissions = allPermissions.filter(p =>
      masterActions.some(action => p.name.endsWith(`:${action}`))
    );
    if (masterPermissions.length > 0) {
      const masterPerms = masterPermissions.map(p => ({
        roleId: masterRole,
        permissionId: p.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      await queryInterface.bulkInsert('role_permissions', masterPerms);
    }

    // 6. Разрешения для worker (ограниченный список)
    const workerAllowed = [
      'locations:read',
      'filter-housings:read',
      'filter-instances:read',
      'meters:read',
      'meter-readings:create',
      'meter-readings:read',
      'installations:read',
      'installations:create',
      'work-orders:create',
      'work-orders:read',
      'notifications:read',
      'notifications:update',
    ];
    const workerPermissions = allPermissions.filter(p => workerAllowed.includes(p.name));
    if (workerPermissions.length > 0) {
      const workerPerms = workerPermissions.map(p => ({
        roleId: workerRole,
        permissionId: p.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      await queryInterface.bulkInsert('role_permissions', workerPerms);
    }
  },

  async down(queryInterface, Sequelize) {
    // Откат: удаляем все данные из role_permissions, permissions, roles
    await queryInterface.bulkDelete('role_permissions', null, {});
    await queryInterface.bulkDelete('permissions', null, {});
    await queryInterface.bulkDelete('roles', null, {});
  },
};