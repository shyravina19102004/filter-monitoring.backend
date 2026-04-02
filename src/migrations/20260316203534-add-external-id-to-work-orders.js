'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('work_orders', 'externalId', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true
    });
    await queryInterface.addColumn('work_orders', 'source', {
      type: Sequelize.STRING,
      defaultValue: 'manual'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('work_orders', 'externalId');
    await queryInterface.removeColumn('work_orders', 'source');
  }
};