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

describe('Reports API', () => {
  test('GET /api/reports/violations - should return JSON', async () => {
    const res = await request(app)
      .get('/api/reports/violations')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
  });

  test('GET /api/reports/violations?format=pdf - should return PDF', async () => {
    const res = await request(app)
      .get('/api/reports/violations?format=pdf')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
  });

  test('GET /api/reports/usage-analysis - should return JSON', async () => {
    const res = await request(app)
      .get('/api/reports/usage-analysis')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
  });
  test('GET /api/reports/forecast - should return JSON', async () => {
  const res = await request(app)
    .get('/api/reports/forecast')
    .set('Authorization', `Bearer ${adminToken}`);
  expect(res.statusCode).toBe(200);
});

test('GET /api/reports/efficiency - should return JSON', async () => {
  const res = await request(app)
    .get('/api/reports/efficiency')
    .set('Authorization', `Bearer ${adminToken}`);
  expect(res.statusCode).toBe(200);
});

test('GET /api/reports/stock - should return JSON', async () => {
  const res = await request(app)
    .get('/api/reports/stock')
    .set('Authorization', `Bearer ${adminToken}`);
  expect(res.statusCode).toBe(200);
});

test('GET /api/reports/dynamics - should return JSON', async () => {
  const res = await request(app)
    .get('/api/reports/dynamics')
    .set('Authorization', `Bearer ${adminToken}`);
  expect(res.statusCode).toBe(200);
});
test('GET /api/reports/stock?format=pdf - should return PDF', async () => {
  const res = await request(app)
    .get('/api/reports/stock?format=pdf')
    .set('Authorization', `Bearer ${adminToken}`);
  expect(res.statusCode).toBe(200);
  expect(res.headers['content-type']).toBe('application/pdf');
});

test('GET /api/reports/forecast?format=xlsx - should return Excel', async () => {
  const res = await request(app)
    .get('/api/reports/forecast?format=xlsx')
    .set('Authorization', `Bearer ${adminToken}`);
  expect(res.statusCode).toBe(200);
  expect(res.headers['content-type']).toMatch(/spreadsheetml.sheet/);
});
});