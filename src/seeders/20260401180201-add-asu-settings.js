'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Проверим, есть ли уже настройки, чтобы не дублировать
    const existing = await queryInterface.rawSelect(
      'settings',
      { where: { key: 'asu.apiUrl' } },
      ['id']
    );
    if (existing) {
      console.log('ASU settings already exist, skipping.');
      return;
    }

    await queryInterface.bulkInsert('settings', [
      {
        key: 'asu.apiUrl',
        value: JSON.stringify(''),
        description: 'URL API системы АСУ ТП',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        key: 'asu.apiKey',
        value: JSON.stringify(''),
        description: 'Ключ API для доступа к АСУ ТП',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        key: 'asu.syncCron',
        value: JSON.stringify('0 */6 * * *'), // каждые 6 часов, например
        description: 'Расписание синхронизации с АСУ ТП (cron)',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        key: 'asu.lastSyncTime',
        value: JSON.stringify(null),
        description: 'Время последней синхронизации',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        key: 'asu.lastSyncStatus',
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
        [Sequelize.Op.in]: ['asu.apiUrl', 'asu.apiKey', 'asu.syncCron', 'asu.lastSyncTime', 'asu.lastSyncStatus']
      }
    }, {});
  }
};