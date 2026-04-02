const request = require('supertest');
const app = require('../../src/app');
const { sequelize, Location, LocationType } = require('../../src/models');

let adminToken;
let locationId;

beforeAll(async () => {
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@example.com', password: 'admin123' });
  adminToken = loginRes.body.token;

  const locationType = await LocationType.findOne();
  const [location] = await Location.findOrCreate({
    where: { name: 'Test Loc for Housing' },
    defaults: { name: 'Test Loc for Housing', locationTypeId: locationType.id, parentId: null }
  });
  locationId = location.id;
});

afterAll(async () => {
  await sequelize.close();
});

describe('Filter Housings API', () => {
  let housingId;

  test('POST /api/filter-housings - should create', async () => {
    const res = await request(app)
      .post('/api/filter-housings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ locationId, name: `Test Housing ${Date.now()}`, description: 'Test' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    housingId = res.body.id;
  });

  test('GET /api/filter-housings - should list', async () => {
    const res = await request(app)
      .get('/api/filter-housings')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/filter-housings/:id - should get by id', async () => {
    const res = await request(app)
      .get(`/api/filter-housings/${housingId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(housingId);
  });

  test('PUT /api/filter-housings/:id - should update', async () => {
    const res = await request(app)
      .put(`/api/filter-housings/${housingId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Housing' });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated Housing');
  });

  test('DELETE /api/filter-housings/:id - should delete', async () => {
    const res = await request(app)
      .delete(`/api/filter-housings/${housingId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(204);
  });
});