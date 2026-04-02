const request = require('supertest');
const app = require('../../src/app');
const { Op } = require('sequelize');
const { sequelize, FilterModel, Manufacturer, FilterType } = require('../../src/models');

let adminToken;
let filterModelId;

beforeAll(async () => {
  const uniqueSuffix = Date.now();

  const [manufacturer] = await Manufacturer.findOrCreate({
    where: { name: `Test Manuf ${uniqueSuffix}` },
    defaults: { name: `Test Manuf ${uniqueSuffix}` }
  });
  const [filterType] = await FilterType.findOrCreate({
    where: { name: `Test Type ${uniqueSuffix}` },
    defaults: { name: `Test Type ${uniqueSuffix}` }
  });
  const [filterModel] = await FilterModel.findOrCreate({
    where: { name: `Test Model ${uniqueSuffix}` },
    defaults: {
      name: `Test Model ${uniqueSuffix}`,
      filterTypeId: filterType.id,
      manufacturerId: manufacturer.id,
      lifeTimeDays: 30,
      lifeVolume: 10000
    }
  });
  filterModelId = filterModel.id;

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@example.com', password: 'admin123' });
  adminToken = loginRes.body.token;
});

afterAll(async () => {
  try {
    await FilterModel.destroy({ where: { name: { [Op.like]: 'Test Model %' } } });
  } catch (e) {}
  try {
    await Manufacturer.destroy({ where: { name: { [Op.like]: 'Test Manuf %' } } });
  } catch (e) {}
  try {
    await FilterType.destroy({ where: { name: { [Op.like]: 'Test Type %' } } });
  } catch (e) {}
  await sequelize.close();
});

describe('Rules API', () => {
  let ruleId;

  test('POST /api/rules - should create rule', async () => {
    const res = await request(app)
      .post('/api/rules')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        filterModelId,
        parameter: 'volume',
        threshold: 5000,
        unit: 'liters',
        action: 'warning',
        isActive: true
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    ruleId = res.body.id;
  });

  test('GET /api/rules - should list rules', async () => {
    const res = await request(app)
      .get('/api/rules')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/rules/:id - should get by id', async () => {
    const res = await request(app)
      .get(`/api/rules/${ruleId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(ruleId);
  });

  test('PUT /api/rules/:id - should update rule', async () => {
    const res = await request(app)
      .put(`/api/rules/${ruleId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ threshold: 6000 });
    expect(res.statusCode).toBe(200);
    expect(res.body.threshold).toBe(6000);
  });

  test('POST /api/rules/check - should run rule engine', async () => {
    const res = await request(app)
      .post('/api/rules/check')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/запущена и завершена/);
  });
  test('POST /api/rules - should fail if filterModelId does not exist', async () => {
  const res = await request(app)
    .post('/api/rules')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      filterModelId: 999999,
      parameter: 'volume',
      threshold: 5000,
      unit: 'liters',
      action: 'warning',
      isActive: true
    });
  expect(res.statusCode).toBe(400);
  expect(res.body.error.message).toMatch(/не существует/);
});

test('DELETE /api/rules/:id - should delete rule', async () => {
  const createRes = await request(app)
    .post('/api/rules')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      filterModelId,
      parameter: 'time',
      threshold: 30,
      unit: 'days',
      action: 'critical',
      isActive: true
    });
  const ruleId = createRes.body.id;
  const delRes = await request(app)
    .delete(`/api/rules/${ruleId}`)
    .set('Authorization', `Bearer ${adminToken}`);
  expect(delRes.statusCode).toBe(204);
});

test('GET /api/rules/:id - should return 404 for non-existent rule', async () => {
  const res = await request(app)
    .get('/api/rules/999999')
    .set('Authorization', `Bearer ${adminToken}`);
  expect(res.statusCode).toBe(404);
});
});