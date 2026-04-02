'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('meters', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      locationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'locations',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      unitId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'units',
          key: 'id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      type: {
        type: Sequelize.ENUM('manual', 'auto'),
        allowNull: false,
        defaultValue: 'manual'
      },
      lastValue: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      lastReadingDate: {
        type: Sequelize.DATE,
        allowNull: true
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

    await queryInterface.addIndex('meters', ['locationId']);
    await queryInterface.addIndex('meters', ['unitId']);
    await queryInterface.addIndex('meters', ['type']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('meters');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_meters_type";');
  }
};