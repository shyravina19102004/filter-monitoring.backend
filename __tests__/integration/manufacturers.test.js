const request = require('supertest');
const app = require('../../src/app');
const { sequelize, Manufacturer } = require('../../src/models');

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

describe('Manufacturers API', () => {
  let manufacturerId;

  test('POST /api/manufacturers - should create manufacturer', async () => {
    const res = await request(app)
      .post('/api/manufacturers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `Test Manuf ${Date.now()}`, country: 'Test' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    manufacturerId = res.body.id;
  });

  test('GET /api/manufacturers - should list', async () => {
    const res = await request(app)
      .get('/api/manufacturers')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/manufacturers/:id - should get by id', async () => {
    const res = await request(app)
      .get(`/api/manufacturers/${manufacturerId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(manufacturerId);
  });

  test('PUT /api/manufacturers/:id - should update', async () => {
    const res = await request(app)
      .put(`/api/manufacturers/${manufacturerId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Name' });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated Name');
  });

  test('DELETE /api/manufacturers/:id - should delete', async () => {
    const res = await request(app)
      .delete(`/api/manufacturers/${manufacturerId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(204);
  });
});