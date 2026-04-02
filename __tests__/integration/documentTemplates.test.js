const request = require('supertest');
const app = require('../../src/app');
const { sequelize, DocumentTemplate } = require('../../src/models');

let adminToken;

beforeAll(async () => {
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@example.com', password: 'admin123' });
  adminToken = loginRes.body.token;
});

afterAll(async () => {
  await sequelize.close();
});

describe('Document Templates API', () => {
  let templateId;

  test('POST /api/document-templates - should create', async () => {
    const res = await request(app)
      .post('/api/document-templates')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Test Template ${Date.now()}`,
        type: 'label',
        content: 'Test content',
        orientation: 'portrait',
        pageSize: 'A6',
        isDefault: false
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    templateId = res.body.id;
  });

  test('GET /api/document-templates - should list', async () => {
    const res = await request(app)
      .get('/api/document-templates')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeDefined();
  });

  test('GET /api/document-templates/:id - should get by id', async () => {
    const res = await request(app)
      .get(`/api/document-templates/${templateId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(templateId);
  });

  test('PUT /api/document-templates/:id - should update', async () => {
    const res = await request(app)
      .put(`/api/document-templates/${templateId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Template' });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated Template');
  });

  test('DELETE /api/document-templates/:id - should delete', async () => {
    const res = await request(app)
      .delete(`/api/document-templates/${templateId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(204);
  });
});