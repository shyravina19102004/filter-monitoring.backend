'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('filter_models', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      filterTypeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'filter_types',
          key: 'id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      manufacturerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'manufacturers',
          key: 'id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      lifeTimeDays: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      lifeVolume: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      minStock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
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

    await queryInterface.addIndex('filter_models', ['name'], {
      unique: true,
      name: 'filter_models_name_unique'
    });
    await queryInterface.addIndex('filter_models', ['filterTypeId']);
    await queryInterface.addIndex('filter_models', ['manufacturerId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('filter_models');
  }
};