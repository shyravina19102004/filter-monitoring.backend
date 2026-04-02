const request = require('supertest');
const app = require('../../src/app');
const { sequelize, WorkOrder, Attachment } = require('../../src/models');
const fs = require('fs');
const path = require('path');

let adminToken;
let attachmentId;
let workOrderId;

beforeAll(async () => {
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@example.com', password: 'admin123' });
  adminToken = loginRes.body.token;

  // Создаём workOrder для вложения
  const workOrder = await WorkOrder.create({
    workDate: new Date(),
    workType: 'inspection',
    status: 'draft'
  });
  workOrderId = workOrder.id;

  // Создаём тестовый файл на диске
  const testFilePath = path.join(__dirname, '../../uploads/test.txt');
  fs.writeFileSync(testFilePath, 'test content');
  const attachment = await Attachment.create({
    workOrderId,
    fileName: 'test.txt',
    filePath: testFilePath,
    mimeType: 'text/plain',
    size: 12
  });
  attachmentId = attachment.id;
});

afterAll(async () => {
  // Удаляем тестовый файл
  const testFilePath = path.join(__dirname, '../../uploads/test.txt');
  if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath);
  await Attachment.destroy({ where: { id: attachmentId } });
  await WorkOrder.destroy({ where: { id: workOrderId } });
  await sequelize.close();
});

describe('Files API', () => {
  test('GET /api/files/work-order-attachments/:filename - should download attachment', async () => {
    const res = await request(app)
      .get(`/api/files/work-order-attachments/test.txt`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-disposition']).toMatch(/attachment/);
  });
});