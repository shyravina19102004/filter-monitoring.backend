'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('work_orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      workDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      oldInstallationId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'installations',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      newInstallationId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'installations',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      workType: {
        type: Sequelize.ENUM('replacement', 'inspection', 'repair'),
        allowNull: false,
        defaultValue: 'replacement'
      },
      performedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      approvedBy: {
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
      status: {
        type: Sequelize.ENUM('draft', 'confirmed', 'cancelled'),
        allowNull: false,
        defaultValue: 'draft'
      },
      pdfPath: {
        type: Sequelize.STRING,
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

    await queryInterface.addIndex('work_orders', ['workDate']);
    await queryInterface.addIndex('work_orders', ['oldInstallationId']);
    await queryInterface.addIndex('work_orders', ['newInstallationId']);
    await queryInterface.addIndex('work_orders', ['performedBy']);
    await queryInterface.addIndex('work_orders', ['approvedBy']);
    await queryInterface.addIndex('work_orders', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('work_orders');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_work_orders_workType";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_work_orders_status";');
  }
};