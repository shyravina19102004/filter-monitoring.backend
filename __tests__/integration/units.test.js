const request = require('supertest');
const app = require('../../src/app');
const { sequelize } = require('../../src/models');

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

describe('Units API', () => {
  let unitId;

  test('POST /api/units - should create unit', async () => {
    const res = await request(app)
      .post('/api/units')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `Test Unit ${Date.now()}`, symbol: 'tu', description: 'Test' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    unitId = res.body.id;
  });

  test('GET /api/units - should list', async () => {
    const res = await request(app)
      .get('/api/units')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/units/:id - should get by id', async () => {
    const res = await request(app)
      .get(`/api/units/${unitId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(unitId);
  });

  test('PUT /api/units/:id - should update', async () => {
    const res = await request(app)
      .put(`/api/units/${unitId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Unit' });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated Unit');
  });

  test('DELETE /api/units/:id - should delete', async () => {
    const res = await request(app)
      .delete(`/api/units/${unitId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(204);
  });
});