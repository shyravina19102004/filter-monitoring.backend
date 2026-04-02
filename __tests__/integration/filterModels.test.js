const request = require('supertest');
const app = require('../../src/app');
const { sequelize, FilterModel, Manufacturer, FilterType } = require('../../src/models');

let adminToken;
let manufacturerId, filterTypeId;

beforeAll(async () => {
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@example.com', password: 'admin123' });
  adminToken = loginRes.body.token;

  const uniqueSuffix = Date.now();
  const manufacturer = await Manufacturer.create({ name: `Test Manuf ${uniqueSuffix}` });
  manufacturerId = manufacturer.id;
  const filterType = await FilterType.create({ name: `Test Type ${uniqueSuffix}` });
  filterTypeId = filterType.id;
});

afterAll(async () => {
  await sequelize.close();
});

describe('Filter Models API', () => {
  let modelId;

  test('POST /api/filter-models - should create model', async () => {
    const res = await request(app)
      .post('/api/filter-models')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Test Model ${Date.now()}`,
        filterTypeId,
        manufacturerId,
        lifeTimeDays: 30,
        lifeVolume: 10000,
        minStock: 5
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    modelId = res.body.id;
  });

  test('GET /api/filter-models - should list models', async () => {
    const res = await request(app)
      .get('/api/filter-models')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeDefined();
  });

  test('GET /api/filter-models/:id - should get by id', async () => {
    const res = await request(app)
      .get(`/api/filter-models/${modelId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(modelId);
  });

  test('PUT /api/filter-models/:id - should update', async () => {
    const res = await request(app)
      .put(`/api/filter-models/${modelId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Model' });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated Model');
  });

  test('DELETE /api/filter-models/:id - should delete', async () => {
    const res = await request(app)
      .delete(`/api/filter-models/${modelId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(204);
  });
});