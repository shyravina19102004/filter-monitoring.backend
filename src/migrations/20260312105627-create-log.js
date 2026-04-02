'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('logs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL', // если пользователь удалён, логи остаются
        onUpdate: 'CASCADE'
      },
      action: {
        type: Sequelize.STRING,
        allowNull: false
      },
      module: {
        type: Sequelize.STRING,
        allowNull: true
      },
      ipAddress: {
        type: Sequelize.STRING,
        allowNull: true
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('success', 'error', 'warning'),
        allowNull: false,
        defaultValue: 'success'
      },
      details: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
    }, {
      updatedAt: false // отключаем updatedAt на уровне таблицы
    });

    await queryInterface.addIndex('logs', ['userId']);
    await queryInterface.addIndex('logs', ['action']);
    await queryInterface.addIndex('logs', ['module']);
    await queryInterface.addIndex('logs', ['status']);
    await queryInterface.addIndex('logs', ['createdAt']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('logs');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_logs_status";');
  }
};