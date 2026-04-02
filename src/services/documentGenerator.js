const Handlebars = require('handlebars');
const { generateLabelPdf, generateWorkOrderPdf, generateReportPdf } = require('../utils/pdfGenerator');
const { generateExcel } = require('../utils/excelGenerator');
const { DocumentTemplate } = require('../models');

/**
 * Получить шаблон из БД по типу и имени (или default)
 * @param {string} type - 'label', 'work_order', 'report'
 * @param {string} name - конкретное имя 
 * @returns {Promise<Object>} - объект шаблона
 */
async function getTemplate(type, name = null) {
  const where = { type };
  if (name) where.name = name;
  else where.isDefault = true; // берём шаблон по умолчанию
  const template = await DocumentTemplate.findOne({ where });
  if (!template) {
    // Если нет шаблона, возвращаем встроенный (заглушку)
    return { content: getDefaultTemplate(type) };
  }
  return template;
}

/**
 * Встроенные шаблоны на случай отсутствия в БД
 */
function getDefaultTemplate(type) {
  switch (type) {
    case 'label':
      return 'Модель: {{filterModel}}\nТип: {{filterType}}\nСерийный номер: {{serialNumber}}\nДата установки: {{installationDate}}\nНачальный литраж: {{initialMeter}} л\nМесто установки: {{locationPath}}';
    case 'work_order':
      return 'АКТ ВЫПОЛНЕННЫХ РАБОТ\nНомер: {{workOrderNumber}}\nДата: {{workDate}}\nОборудование: {{equipment}}\nСтарый фильтр: {{oldFilter}}\nНовый фильтр: {{newFilter}}\nИсполнитель: {{performer}}\nМастер: {{master}}\nПримечания: {{notes}}';
    case 'report':
      return '{{title}}\n\n{{#each rows}}{{#each this}}{{this}} {{/each}}\n{{/each}}';
    default:
      return '';
  }
}

/**
 * Генерация этикетки
 * @param {Object} data - данные для подстановки
 * @returns {Promise<Buffer>}
 */
async function generateLabel(data) {
  const template = await getTemplate('label');
  const compiled = Handlebars.compile(template.content);
  const textContent = compiled(data); 
  return generateLabelPdf(data);
}

/**
 * Генерация акта работ
 * @param {Object} data
 * @returns {Promise<Buffer>}
 */
async function generateWorkOrder(data) {
  const template = await getTemplate('work_order');
  return generateWorkOrderPdf(data);
}

/**
 * Генерация отчёта в указанном формате
 * @param {string} format - 'pdf' или 'xlsx'
 * @param {string} title - заголовок
 * @param {Array} columns - колонки
 * @param {Array} data - данные
 * @returns {Promise<Buffer>}
 */
async function generateReport(format, title, columns, data) {
  if (format === 'xlsx') {
    return generateExcel(title, columns, data);
  } else {
    // PDF
    return generateReportPdf(title, columns, data);
  }
}

module.exports = {
  generateLabel,
  generateWorkOrder,
  generateReport,
};