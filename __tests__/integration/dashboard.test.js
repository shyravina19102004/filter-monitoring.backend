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

describe('Dashboard API', () => {
  test('GET /api/dashboard/summary - should return summary', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('criticalNotifications');
    expect(res.body).toHaveProperty('upcomingReplacements');
    expect(res.body).toHaveProperty('stockSummary');
    expect(res.body).toHaveProperty('efficiency');
  });
});