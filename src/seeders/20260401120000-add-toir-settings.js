'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Проверим, есть ли уже записи, чтобы не дублировать
    const existing = await queryInterface.rawSelect(
      'settings',
      { where: { key: 'toir.apiUrl' } },
      ['id']
    );
    if (existing) {
      console.log('TOIR settings already exist, skipping seed.');
      return;
    }

    await queryInterface.bulkInsert('settings', [
      {
        key: 'toir.apiUrl',
        value: JSON.stringify(''),
        description: 'URL API системы ТОИР',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        key: 'toir.apiKey',
        value: JSON.stringify(''),
        description: 'Ключ API для доступа к ТОИР',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        key: 'toir.syncCron',
        value: JSON.stringify('0 2 * * *'),
        description: 'Расписание синхронизации с ТОИР (cron)',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        key: 'toir.lastSyncTime',
        value: JSON.stringify(null),
        description: 'Время последней синхронизации',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        key: 'toir.lastSyncStatus',
        value: JSON.stringify('unknown'),
        description: 'Статус последней синхронизации',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('settings', {
      key: {
        [Sequelize.Op.in]: ['toir.apiUrl', 'toir.apiKey', 'toir.syncCron', 'toir.lastSyncTime', 'toir.lastSyncStatus']
      }
    }, {});
  }
};