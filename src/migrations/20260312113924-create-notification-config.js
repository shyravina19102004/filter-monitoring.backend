'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notification_configs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      channel: {
        type: Sequelize.ENUM('telegram', 'email', 'sms'),
        allowNull: false
      },
      config: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('notification_configs', ['channel']);
    await queryInterface.addIndex('notification_configs', ['isActive']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('notification_configs');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_notification_configs_channel";');
  }
};