'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('meter_readings', 'source', {
      type: Sequelize.STRING,
      defaultValue: 'manual',
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('meter_readings', 'source');
  }
};