'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Проверим, есть ли уже записи
    const existing = await queryInterface.rawSelect('document_templates', { where: {} }, ['id']);
    if (existing) return;

    await queryInterface.bulkInsert('document_templates', [
      {
        name: 'Этикетка по умолчанию',
        type: 'label',
        content: 'Модель: {{filterModel}}\nТип: {{filterType}}\nСерийный номер: {{serialNumber}}\nДата установки: {{installationDate}}\nНачальный литраж: {{initialMeter}} л\nМесто установки: {{locationPath}}',
        orientation: 'portrait',
        pageSize: 'A6',
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Акт замены по умолчанию',
        type: 'work_order',
        content: 'АКТ ВЫПОЛНЕННЫХ РАБОТ\nНомер: {{workOrderNumber}}\nДата: {{workDate}}\nОборудование: {{equipment}}\nСтарый фильтр: {{oldFilter}}\nНовый фильтр: {{newFilter}}\nИсполнитель: {{performer}}\nМастер: {{master}}\nПримечания: {{notes}}',
        orientation: 'portrait',
        pageSize: 'A4',
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Отчёт по нарушениям',
        type: 'report',
        content: '{{title}}\n\n{{#each rows}}{{#each this}}{{this}} {{/each}}\n{{/each}}',
        orientation: 'landscape',
        pageSize: 'A4',
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('document_templates', { type: ['label', 'work_order', 'report'] });
  }
};