'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('filter_instances', {
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
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      serialNumber: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      status: {
        type: Sequelize.ENUM('in_stock', 'installed', 'written_off'),
        allowNull: false,
        defaultValue: 'in_stock'
      },
      purchaseDate: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      installationDate: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      warrantyEndDate: {
        type: Sequelize.DATEONLY,
        allowNull: true
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

    await queryInterface.addIndex('filter_instances', ['filterModelId']);
    await queryInterface.addIndex('filter_instances', ['serialNumber'], {
      unique: true,
      name: 'filter_instances_serialNumber_unique',
      where: { serialNumber: { [Sequelize.Op.not]: null } } // частичный уникальный индекс
    });
    await queryInterface.addIndex('filter_instances', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('filter_instances');
    // Удаляем созданные ENUM-типы
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_filter_instances_status";');
  }
};