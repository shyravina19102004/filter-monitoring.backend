const request = require('supertest');
const app = require('../../src/app');
const { Op } = require('sequelize');
const { sequelize, Role, Location, LocationType, FilterHousing, FilterModel, FilterInstance, Manufacturer, FilterType } = require('../../src/models');

let adminToken;
let testHousingId;
let testFilterInstanceId;

beforeAll(async () => {
  const locationType = await LocationType.findOne();
  if (!locationType) throw new Error('No location type found in seeds');

  const uniqueSuffix = Date.now();

  // Производитель
  const [manufacturer] = await Manufacturer.findOrCreate({
    where: { name: `Test Manufacturer ${uniqueSuffix}` },
    defaults: { name: `Test Manufacturer ${uniqueSuffix}`, country: 'Test' }
  });

  // Тип фильтра
  const [filterType] = await FilterType.findOrCreate({
    where: { name: `Test Filter Type ${uniqueSuffix}` },
    defaults: { name: `Test Filter Type ${uniqueSuffix}` }
  });

  // Модель фильтра
  const [filterModel] = await FilterModel.findOrCreate({
    where: { name: `Test Model ${uniqueSuffix}` },
    defaults: {
      name: `Test Model ${uniqueSuffix}`,
      filterTypeId: filterType.id,
      manufacturerId: manufacturer.id,
      lifeTimeDays: 30,
      lifeVolume: 10000,
      minStock: 1
    }
  });

  // Экземпляр фильтра
  const [filterInstance] = await FilterInstance.findOrCreate({
    where: { serialNumber: `TEST123-${uniqueSuffix}` },
    defaults: {
      filterModelId: filterModel.id,
      serialNumber: `TEST123-${uniqueSuffix}`,
      status: 'in_stock'
    }
  });
  testFilterInstanceId = filterInstance.id;

  // Локация
  const [location] = await Location.findOrCreate({
    where: { name: `Test Location ${uniqueSuffix}` },
    defaults: {
      name: `Test Location ${uniqueSuffix}`,
      locationTypeId: locationType.id,
      parentId: null
    }
  });

  // Корпус фильтра
  const [housing] = await FilterHousing.findOrCreate({
    where: { name: `Test Housing ${uniqueSuffix}` },
    defaults: {
      locationId: location.id,
      name: `Test Housing ${uniqueSuffix}`,
      description: 'Test'
    }
  });
  testHousingId = housing.id;

  // Логин под существующим администратором из сидов
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@example.com', password: 'admin123' });
  adminToken = loginRes.body.token;
});

afterAll(async () => {
  // Удаляем созданные данные по шаблону
  try {
    await FilterInstance.destroy({ where: { serialNumber: { [Op.like]: 'TEST123-%' } } });
  } catch (e) {}
  try {
    await FilterModel.destroy({ where: { name: { [Op.like]: 'Test Model %' } } });
  } catch (e) {}
  try {
    await FilterType.destroy({ where: { name: { [Op.like]: 'Test Filter Type %' } } });
  } catch (e) {}
  try {
    await Manufacturer.destroy({ where: { name: { [Op.like]: 'Test Manufacturer %' } } });
  } catch (e) {}
  try {
    await FilterHousing.destroy({ where: { name: { [Op.like]: 'Test Housing %' } } });
  } catch (e) {}
  try {
    await Location.destroy({ where: { name: { [Op.like]: 'Test Location %' } } });
  } catch (e) {}
  await sequelize.close();
});

describe('Installations API', () => {
  let installationId;

  test('POST /api/installations - should create installation', async () => {
    const res = await request(app)
      .post('/api/installations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        housingId: testHousingId,
        filterInstanceId: testFilterInstanceId,
        installationDate: new Date().toISOString(),
        notes: 'Test installation'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.housingId).toBe(testHousingId);
    installationId = res.body.id;
  });

  test('GET /api/installations - should return list', async () => {
    const res = await request(app)
      .get('/api/installations')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /api/installations/:id - should return by id', async () => {
    const res = await request(app)
      .get(`/api/installations/${installationId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(installationId);
  });

  test('GET /api/installations/history/:housingId - should return history', async () => {
    const res = await request(app)
      .get(`/api/installations/history/${testHousingId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  test('POST /api/installations - should fail if filter not in stock', async () => {
  const usedInstance = await FilterInstance.create({
    filterModelId: (await FilterModel.findOne()).id,
    serialNumber: 'USED123',
    status: 'installed'
  });
  const res = await request(app)
    .post('/api/installations')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      housingId: testHousingId,
      filterInstanceId: usedInstance.id,
      installationDate: new Date().toISOString(),
      notes: 'Should fail'
    });
  expect(res.statusCode).toBe(400);
  expect(res.body.error.message).toMatch(/не на складе/);
});

test('POST /api/installations - should fail if housing not found', async () => {
  const res = await request(app)
    .post('/api/installations')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      housingId: 99999,
      filterInstanceId: testFilterInstanceId,
      installationDate: new Date().toISOString()
    });
  expect(res.statusCode).toBe(404);
});
});