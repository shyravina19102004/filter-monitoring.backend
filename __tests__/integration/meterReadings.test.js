const request = require('supertest');
const app = require('../../src/app');
const { sequelize, Meter, Location, Unit, LocationType } = require('../../src/models');

let adminToken;
let meterId;

beforeAll(async () => {
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@example.com', password: 'admin123' });
  adminToken = loginRes.body.token;

  // Создаём локацию и единицу измерения для счётчика
  const locationType = await LocationType.findOne();
  if (!locationType) throw new Error('No location type found');
  const [location] = await Location.findOrCreate({
    where: { name: 'Test Location for MeterReading' },
    defaults: { name: 'Test Location for MeterReading', locationTypeId: locationType.id, parentId: null }
  });
  const [unit] = await Unit.findOrCreate({
    where: { name: 'Test Unit for MeterReading' },
    defaults: { name: 'Test Unit for MeterReading', symbol: 'tu' }
  });

  // Создаём счётчик
  const meter = await Meter.create({
    locationId: location.id,
    name: 'Test Meter for Reading',
    unitId: unit.id,
    type: 'manual'
  });
  meterId = meter.id;
});

afterAll(async () => {
  await sequelize.close();
});

describe('Meter Readings API', () => {
  let readingId;

  test('POST /api/meter-readings - should create reading', async () => {
    const res = await request(app)
      .post('/api/meter-readings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        meterId,
        value: 1000,
        readingDate: new Date().toISOString(),
        notes: 'Test'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    readingId = res.body.id;
  });

  test('GET /api/meter-readings - should list', async () => {
    const res = await request(app)
      .get('/api/meter-readings')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeDefined();
  });

  test('GET /api/meter-readings/:id - should get by id', async () => {
    const res = await request(app)
      .get(`/api/meter-readings/${readingId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(readingId);
  });
});