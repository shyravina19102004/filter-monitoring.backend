'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('attachments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      workOrderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'work_orders',
          key: 'id'
        },
        onDelete: 'CASCADE', // при удалении заявки удаляем и фото
        onUpdate: 'CASCADE'
      },
      fileName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      filePath: {
        type: Sequelize.STRING,
        allowNull: false
      },
      mimeType: {
        type: Sequelize.STRING,
        allowNull: true
      },
      size: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('attachments', ['workOrderId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('attachments');
  }
};