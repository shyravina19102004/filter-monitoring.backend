const request = require('supertest');
const app = require('../../src/app');
const { sequelize, LocationType, Location, FilterHousing, FilterModel, FilterInstance, Manufacturer, FilterType, WorkOrder } = require('../../src/models');

let adminToken;
let testHousingId;
let testFilterInstanceId;
let workOrderId;

beforeAll(async () => {
  const locationType = await LocationType.findOne();
  if (!locationType) throw new Error('No location type found');

  const [manufacturer] = await Manufacturer.findOrCreate({
    where: { name: 'Test Manufacturer' },
    defaults: { name: 'Test Manufacturer' }
  });
  const [filterType] = await FilterType.findOrCreate({
    where: { name: 'Test Filter Type' },
    defaults: { name: 'Test Filter Type' }
  });

  const [filterModel] = await FilterModel.findOrCreate({
    where: { name: 'Test Model' },
    defaults: {
      name: 'Test Model',
      filterTypeId: filterType.id,
      manufacturerId: manufacturer.id,
      lifeTimeDays: 30,
      lifeVolume: 10000
    }
  });

  const [filterInstance] = await FilterInstance.findOrCreate({
    where: { serialNumber: 'TEST123' },
    defaults: {
      filterModelId: filterModel.id,
      serialNumber: 'TEST123',
      status: 'in_stock'
    }
  });
  testFilterInstanceId = filterInstance.id;

  const [location] = await Location.findOrCreate({
    where: { name: 'Test Location' },
    defaults: {
      name: 'Test Location',
      locationTypeId: locationType.id,
      parentId: null
    }
  });

  const [housing] = await FilterHousing.findOrCreate({
    where: { name: 'Test Housing' },
    defaults: {
      locationId: location.id,
      name: 'Test Housing'
    }
  });
  testHousingId = housing.id;

  // Логин под существующим администратором из сидов
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@example.com', password: 'admin123' });
  adminToken = loginRes.body.token;

  // Создаём установку, чтобы появился workOrder
  const installRes = await request(app)
    .post('/api/installations')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      housingId: testHousingId,
      filterInstanceId: testFilterInstanceId,
      installationDate: new Date().toISOString(),
      notes: 'Test'
    });
  if (installRes.statusCode === 201) {
    const workOrder = await WorkOrder.findOne({ order: [['id', 'DESC']] });
    if (workOrder) workOrderId = workOrder.id;
  }
});

afterAll(async () => {
  if (workOrderId) {
    try { await WorkOrder.destroy({ where: { id: workOrderId } }); } catch (e) {}
  }
  try { await FilterInstance.destroy({ where: { serialNumber: 'TEST123' } }); } catch (e) {}
  try { await FilterModel.destroy({ where: { name: 'Test Model' } }); } catch (e) {}
  try { await FilterType.destroy({ where: { name: 'Test Filter Type' } }); } catch (e) {}
  try { await Manufacturer.destroy({ where: { name: 'Test Manufacturer' } }); } catch (e) {}
  try { await FilterHousing.destroy({ where: { name: 'Test Housing' } }); } catch (e) {}
  try { await Location.destroy({ where: { name: 'Test Location' } }); } catch (e) {}
  await sequelize.close();
});

describe('WorkOrders API', () => {
  test('GET /api/work-orders - should return list', async () => {
    const res = await request(app)
      .get('/api/work-orders')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /api/work-orders/:id - should return by id', async () => {
    const res = await request(app)
      .get(`/api/work-orders/${workOrderId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(workOrderId);
  });

  test('GET /api/work-orders/:id/pdf - should download PDF', async () => {
    const res = await request(app)
      .get(`/api/work-orders/${workOrderId}/pdf`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
  });

  test('POST /api/work-orders/:id/generate-pdf - should regenerate PDF', async () => {
    const res = await request(app)
      .post(`/api/work-orders/${workOrderId}/generate-pdf`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
  });
  test('GET /api/work-orders/:id/pdf - should return 404 if pdf not found', async () => {
  const workOrder = await WorkOrder.create({
    workDate: new Date(),
    workType: 'inspection',
    status: 'draft'
  });
  const res = await request(app)
    .get(`/api/work-orders/${workOrder.id}/pdf`)
    .set('Authorization', `Bearer ${adminToken}`);
  expect(res.statusCode).toBe(404);
  expect(res.body.error.message).toMatch(/PDF не найден/);
});
test('POST /api/work-orders - should create new work order', async () => {
  const res = await request(app)
    .post('/api/work-orders')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      workDate: new Date().toISOString(),
      workType: 'inspection',
      notes: 'Test work order',
      status: 'draft'
    });
  expect(res.statusCode).toBe(201);
  expect(res.body).toHaveProperty('id');
});

test('PUT /api/work-orders/:id - should update work order', async () => {
  const res = await request(app)
    .put(`/api/work-orders/${workOrderId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ status: 'confirmed' });
  expect(res.statusCode).toBe(200);
  expect(res.body.status).toBe('confirmed');
});
});