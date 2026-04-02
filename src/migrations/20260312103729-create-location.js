'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('locations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      locationTypeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'location_types',
          key: 'id'
        },
        onDelete: 'RESTRICT', // запрещаем удаление типа, если есть локации
        onUpdate: 'CASCADE'
      },
      parentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'locations',
          key: 'id'
        },
        onDelete: 'SET NULL', // при удалении родителя оставляем дочерние, но parentId станет null
        onUpdate: 'CASCADE'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      externalId: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Идентификатор из внешней системы (ТОИР)'
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

    // Индексы
    await queryInterface.addIndex('locations', ['locationTypeId']);
    await queryInterface.addIndex('locations', ['parentId']);
    await queryInterface.addIndex('locations', ['externalId']); // для поиска по внешнему ID
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('locations');
  }
};