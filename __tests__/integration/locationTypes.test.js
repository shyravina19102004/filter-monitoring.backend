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

describe('Location Types API', () => {
  let typeId;

  test('POST /api/location-types - should create', async () => {
    const res = await request(app)
      .post('/api/location-types')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Test Type', description: 'Test' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    typeId = res.body.id;
  });

  test('GET /api/location-types - should list', async () => {
    const res = await request(app)
      .get('/api/location-types')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/location-types/:id - should get by id', async () => {
    const res = await request(app)
      .get(`/api/location-types/${typeId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(typeId);
  });

  test('PUT /api/location-types/:id - should update', async () => {
    const res = await request(app)
      .put(`/api/location-types/${typeId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Type' });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated Type');
  });

  test('DELETE /api/location-types/:id - should delete', async () => {
    const res = await request(app)
      .delete(`/api/location-types/${typeId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(204);
  });
});