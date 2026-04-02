const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Путь к шрифту
const fontPath = path.join(__dirname, '../../fonts/DejaVuSans.ttf');

// Проверяем существование файла шрифта
let fontExists = false;
try {
  fs.accessSync(fontPath);
  fontExists = true;
} catch (e) {
  console.warn(`Шрифт не найден: ${fontPath}, используется шрифт по умолчанию (кириллица может не отображаться)`);
}

/**
 * Генерирует PDF-этикетку для фильтра
 */
async function generateLabelPdf(data) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A6', margin: 20 });
      if (fontExists) {
        doc.registerFont('DejaVuSans', fontPath);
        doc.font('DejaVuSans');
      } else {
        doc.font('Helvetica');
      }

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Заголовок
      doc.fontSize(14).text('Этикетка фильтра', { align: 'center' });
      doc.moveDown();

      // Данные
      doc.fontSize(10);
      doc.text(`Модель: ${data.filterModel}`);
      doc.text(`Тип: ${data.filterType}`);
      doc.text(`Серийный номер: ${data.serialNumber}`);
      doc.text(`Дата установки: ${new Date(data.installationDate).toLocaleDateString('ru-RU')}`);
      doc.text(`Начальный литраж: ${data.initialMeter} л`);
      doc.text(`Место установки: ${data.locationPath}`);
      doc.moveDown();

      // QR-код
      if (data.qrBuffer) {
        doc.image(data.qrBuffer, {
          fit: [80, 80],
          align: 'center'
        });
      } else {
        doc.text('QR-код: (место для QR)');
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Генерирует PDF-акт выполненных работ
 */
async function generateWorkOrderPdf(data) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      if (fontExists) {
        doc.registerFont('DejaVuSans', fontPath);
        doc.font('DejaVuSans');
      } else {
        doc.font('Helvetica');
      }

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      doc.fontSize(18).text('АКТ ВЫПОЛНЕННЫХ РАБОТ', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Номер: ${data.workOrderNumber}`);
      doc.text(`Дата: ${new Date(data.workDate).toLocaleDateString('ru-RU')}`);
      doc.moveDown();

      doc.text(`Оборудование: ${data.equipment}`);
      doc.text(`Старый фильтр: ${data.oldFilter}`);
      doc.text(`Новый фильтр: ${data.newFilter}`);
      doc.text(`Исполнитель: ${data.performer}`);
      if (data.master) doc.text(`Мастер: ${data.master}`);
      if (data.notes) doc.text(`Примечания: ${data.notes}`);

      doc.moveDown();
      doc.text('Подписи:', { underline: true });
      doc.text('_______________ (Рабочий)');
      doc.text('_______________ (Мастер)');

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Генерирует отчёт в PDF (табличный)
 */
async function generateReportPdf(title, columns, data) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 30 });
      if (fontExists) {
        doc.registerFont('DejaVuSans', fontPath);
        doc.font('DejaVuSans');
      } else {
        doc.font('Helvetica');
      }

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      doc.fontSize(16).text(title, { align: 'center' });
      doc.moveDown();

      // Проверка на пустые данные
      if (!data || data.length === 0 || !columns || columns.length === 0) {
        doc.fontSize(12).text('Нет данных для отображения', { align: 'center' });
        doc.end();
        return;
      }

      const tableTop = doc.y;
      const rowHeight = 20;
      const colWidth = (doc.page.width - 60) / columns.length;

      // Используем Helvetica-Bold для заголовков
      doc.font('Helvetica-Bold');
      columns.forEach((col, i) => {
        doc.text(col.header, 30 + i * colWidth, tableTop, { width: colWidth, align: 'left' });
      });

      // Возвращаем основной шрифт для данных
      if (fontExists) {
        doc.font('DejaVuSans');
      } else {
        doc.font('Helvetica');
      }

      let y = tableTop + rowHeight;
      data.forEach((row) => {
        columns.forEach((col, colIndex) => {
          doc.text(String(row[col.key] || ''), 30 + colIndex * colWidth, y, { width: colWidth, align: 'left' });
        });
        y += rowHeight;
        if (y > doc.page.height - 50) {
          doc.addPage();
          y = 30;
        }
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  generateLabelPdf,
  generateWorkOrderPdf,
  generateReportPdf,
};