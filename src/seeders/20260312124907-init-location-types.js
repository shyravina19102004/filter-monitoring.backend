'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'location_types',
      [
        {
          name: 'Завод',
          description: 'Предприятие в целом',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Цех',
          description: 'Производственный цех',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Установка',
          description: 'Технологическая установка',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Насос',
          description: 'Насосное оборудование',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Корпус фильтра',
          description: 'Место установки фильтра',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('location_types', null, {});
  },
};