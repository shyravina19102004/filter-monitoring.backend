'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('rules', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      filterModelId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'filter_models',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      parameter: {
        type: Sequelize.ENUM('time', 'volume'),
        allowNull: false
      },
      threshold: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      unit: {
        type: Sequelize.ENUM('days', 'liters', 'hours'),
        allowNull: false
      },
      action: {
        type: Sequelize.ENUM('warning', 'critical'),
        allowNull: false,
        defaultValue: 'warning'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      notificationChannels: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: ['interface']
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

    await queryInterface.addIndex('rules', ['filterModelId']);
    await queryInterface.addIndex('rules', ['isActive']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('rules');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_rules_parameter";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_rules_unit";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_rules_action";');
  }
};