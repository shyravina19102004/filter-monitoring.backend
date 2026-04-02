'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'units',
      [
        {
          name: 'Литры',
          symbol: 'л',
          description: 'Объём в литрах',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Часы',
          symbol: 'ч',
          description: 'Время в часах',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Кубометры',
          symbol: 'м³',
          description: 'Объём в кубометрах',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Штуки',
          symbol: 'шт',
          description: 'Количество',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('units', null, {});
  },
};