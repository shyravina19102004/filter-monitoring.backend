'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('installations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      housingId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'filter_housings',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      filterInstanceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'filter_instances',
          key: 'id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      installationDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      removalDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      meterId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'meters',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      meterReadingAtInstall: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      installedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      notes: {
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

    await queryInterface.addIndex('installations', ['housingId']);
    await queryInterface.addIndex('installations', ['filterInstanceId']);
    await queryInterface.addIndex('installations', ['meterId']);
    await queryInterface.addIndex('installations', ['isActive']);
    await queryInterface.addIndex('installations', ['installationDate']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('installations');
  }
};