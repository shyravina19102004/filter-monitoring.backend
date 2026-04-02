'use strict';

require('dotenv').config();

module.exports = {
  async up(queryInterface, Sequelize) {
    const existing = await queryInterface.rawSelect(
      'notification_configs',
      { where: {} },
      ['id']
    );
    if (existing) {
      console.log('Notification configs already exist, skipping seed.');
      return;
    }

    const emailConfig = {
      host: process.env.SMTP_HOST || '',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      },
      from: process.env.SMTP_FROM || '',
      to: process.env.SMTP_TO || ''
    };

    await queryInterface.bulkInsert('notification_configs', [
      {
        channel: 'email',
        config: JSON.stringify(emailConfig),
        isActive: false,
        description: 'Email-уведомления',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('notification_configs', {
      channel: ['email']
    }, {});
  }
};