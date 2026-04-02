const request = require('supertest');
const app = require('../../src/app');
const { sequelize, User, Role } = require('../../src/models');
const bcrypt = require('bcrypt');

beforeAll(async () => {
  const adminRole = await Role.findOne({ where: { name: 'admin' } });
  if (!adminRole) {
    throw new Error('Role admin not found. Run migrations and seeds first.');
  }
  const existing = await User.findOne({ where: { email: 'admin@test.com' } });
  if (!existing) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await User.create({
      email: 'admin@test.com',
      passwordHash,
      fullName: 'Test Admin',
      roleId: adminRole.id,
      isActive: true
    });
  }
});

afterAll(async () => {
  await User.destroy({ where: { email: 'admin@test.com' } });
  await sequelize.close();
});

describe('Auth API', () => {
  test('POST /api/auth/login - success', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'admin123' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'admin@test.com');
  });

  test('POST /api/auth/login - wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'wrong' });
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
test('GET /api/auth/me - should return current user', async () => {
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@test.com', password: 'admin123' });
  const token = loginRes.body.token;

  const res = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${token}`);
  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty('email', 'admin@test.com');
});

test('PUT /api/auth/me - should update profile', async () => {
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@test.com', password: 'admin123' });
  const token = loginRes.body.token;

  const res = await request(app)
    .put('/api/auth/me')
    .set('Authorization', `Bearer ${token}`)
    .send({ fullName: 'Updated Admin' });
  expect(res.statusCode).toBe(200);
  expect(res.body.fullName).toBe('Updated Admin');
});
});