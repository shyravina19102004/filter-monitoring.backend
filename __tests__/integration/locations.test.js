const request = require('supertest');
const app = require('../../src/app');
const { sequelize, Location, LocationType } = require('../../src/models');

let adminToken;
let locationTypeId;

beforeAll(async () => {
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@example.com', password: 'admin123' });
  adminToken = loginRes.body.token;

  const locationType = await LocationType.findOne();
  if (locationType) locationTypeId = locationType.id;
});

afterAll(async () => {
  await sequelize.close();
});

describe('Locations API', () => {
  let testLocationId;

  test('POST /api/locations - should create location', async () => {
    const res = await request(app)
      .post('/api/locations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Location',
        locationTypeId,
        parentId: null,
        description: 'Test'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    testLocationId = res.body.id;
  });

  test('GET /api/locations - should return list', async () => {
    const res = await request(app)
      .get('/api/locations')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/locations/tree - should return tree', async () => {
    const res = await request(app)
      .get('/api/locations/tree')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/locations/:id - should return by id', async () => {
    const res = await request(app)
      .get(`/api/locations/${testLocationId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(testLocationId);
  });

  test('PUT /api/locations/:id - should update location', async () => {
    const res = await request(app)
      .put(`/api/locations/${testLocationId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Name' });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated Name');
  });

  test('DELETE /api/locations/:id - should delete location', async () => {
    const res = await request(app)
      .delete(`/api/locations/${testLocationId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(204);
  });
});