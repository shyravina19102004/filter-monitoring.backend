'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('document_templates', {
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
      type: {
        type: Sequelize.ENUM('label', 'work_order', 'report'),
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      orientation: {
        type: Sequelize.ENUM('portrait', 'landscape'),
        allowNull: false,
        defaultValue: 'portrait'
      },
      pageSize: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'A4'
      },
      isDefault: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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

    await queryInterface.addIndex('document_templates', ['type']);
    await queryInterface.addIndex('document_templates', ['isDefault']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('document_templates');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_document_templates_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_document_templates_orientation";');
  }
};