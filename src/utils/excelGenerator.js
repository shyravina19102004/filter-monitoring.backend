const ExcelJS = require('exceljs');

/**
 * Генерирует Excel-файл с данными отчёта
 * @param {string} title - заголовок (название листа)
 * @param {Array} columns - массив объектов { header, key }
 * @param {Array} data - массив строк данных
 * @returns {Promise<Buffer>}
 */
async function generateExcel(title, columns, data) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(title);

  // Заголовки
  worksheet.columns = columns.map(col => ({
    header: col.header,
    key: col.key,
    width: 20,
  }));

  // Данные
  worksheet.addRows(data);

  // Стили
  worksheet.getRow(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

module.exports = { generateExcel };