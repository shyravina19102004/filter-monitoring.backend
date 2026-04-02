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

describe('Integrations API', () => {
  test('GET /api/integrations/status - should return status', async () => {
    const res = await request(app)
      .get('/api/integrations/status')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('toir');
    expect(res.body).toHaveProperty('notificationChannels');
  });

  test('POST /api/integrations/toir/sync - should start sync', async () => {
    const res = await request(app)
      .post('/api/integrations/toir/sync')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/запущена/);
  });
});