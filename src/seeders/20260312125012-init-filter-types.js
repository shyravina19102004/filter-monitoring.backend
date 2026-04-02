'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'filter_types',
      [
        {
          name: 'Угольный',
          description: 'Фильтр с угольным наполнителем',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Сетчатый',
          description: 'Сетчатый фильтр грубой очистки',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Тонкой очистки',
          description: 'Фильтр тонкой очистки',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('filter_types', null, {});
  },
};