const request = require('supertest');
const app = require('../../src/app');
const { sequelize, FilterInstance, FilterModel, Manufacturer, FilterType } = require('../../src/models');

let adminToken;
let filterModelId;

beforeAll(async () => {
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@example.com', password: 'admin123' });
  adminToken = loginRes.body.token;

  const uniqueSuffix = Date.now();
  const manufacturer = await Manufacturer.create({ name: `Test Manuf ${uniqueSuffix}` });
  const filterType = await FilterType.create({ name: `Test Type ${uniqueSuffix}` });
  const model = await FilterModel.create({
    name: `Test Model ${uniqueSuffix}`,
    filterTypeId: filterType.id,
    manufacturerId: manufacturer.id
  });
  filterModelId = model.id;
});

afterAll(async () => {
  await sequelize.close();
});

describe('Filter Instances API', () => {
  let instanceId;

  test('POST /api/filter-instances - should create instance', async () => {
    const res = await request(app)
      .post('/api/filter-instances')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        filterModelId,
        serialNumber: `SN${Date.now()}`,
        status: 'in_stock'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    instanceId = res.body.id;
  });

  test('GET /api/filter-instances - should list', async () => {
    const res = await request(app)
      .get('/api/filter-instances')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeDefined();
  });

  test('GET /api/filter-instances/:id - should get by id', async () => {
    const res = await request(app)
      .get(`/api/filter-instances/${instanceId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(instanceId);
  });

  test('PATCH /api/filter-instances/:id/write-off - should write off', async () => {
    const res = await request(app)
      .patch(`/api/filter-instances/${instanceId}/write-off`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('written_off');
  });
});