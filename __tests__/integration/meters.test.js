const request = require('supertest');
const app = require('../../src/app');
const { sequelize, Location, Unit, LocationType } = require('../../src/models');

let adminToken;
let locationId;
let unitId;

beforeAll(async () => {
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@example.com', password: 'admin123' });
  adminToken = loginRes.body.token;

  // Создаём локацию, если нет
  const locationType = await LocationType.findOne();
  if (!locationType) throw new Error('No location type found');
  const [location] = await Location.findOrCreate({
    where: { name: 'Test Location for Meter' },
    defaults: { name: 'Test Location for Meter', locationTypeId: locationType.id, parentId: null }
  });
  locationId = location.id;

  // Создаём единицу измерения, если нет
  const [unit] = await Unit.findOrCreate({
    where: { name: 'Test Unit' },
    defaults: { name: 'Test Unit', symbol: 'tu' }
  });
  unitId = unit.id;
});

afterAll(async () => {
  await sequelize.close();
});

describe('Meters API', () => {
  let meterId;

  test('POST /api/meters - should create meter', async () => {
    const res = await request(app)
      .post('/api/meters')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        locationId,
        name: 'Test Meter',
        unitId,
        type: 'manual'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    meterId = res.body.id;
  });

  test('GET /api/meters - should list', async () => {
    const res = await request(app)
      .get('/api/meters')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/meters/:id - should get by id', async () => {
    const res = await request(app)
      .get(`/api/meters/${meterId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(meterId);
  });

  test('PUT /api/meters/:id - should update', async () => {
    const res = await request(app)
      .put(`/api/meters/${meterId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Meter' });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated Meter');
  });

  test('DELETE /api/meters/:id - should delete', async () => {
    const res = await request(app)
      .delete(`/api/meters/${meterId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(204);
  });
});