const request = require('supertest');
const app = require('../../src/app');
const { sequelize, User, Role, Location } = require('../../src/models');
const bcrypt = require('bcrypt');

let adminToken;
let testUserId;

beforeAll(async () => {
  // Получаем роли из сидов (они уже есть)
  const adminRole = await Role.findOne({ where: { name: 'admin' } });
  const workerRole = await Role.findOne({ where: { name: 'worker' } });
  const location = await Location.findOne(); // любая существующая локация

  // Логин под существующим администратором
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@example.com', password: 'admin123' });
  if (loginRes.statusCode !== 200) {
    throw new Error('Admin user not found. Please run seeds.');
  }
  adminToken = loginRes.body.token;

  // Создаём тестового пользователя (worker), если его нет
  let testUser = await User.findOne({ where: { email: 'testuser@test.com' } });
  if (!testUser) {
    testUser = await User.create({
      email: 'testuser@test.com',
      passwordHash: await bcrypt.hash('test123', 10),
      fullName: 'Test User',
      roleId: workerRole.id,
      locationId: location ? location.id : null,
      isActive: true
    });
  }
  testUserId = testUser.id;
});

afterAll(async () => {
  // Удаляем только созданных тестовых пользователей
  await User.destroy({ where: { email: ['testuser@test.com', 'newuser@test.com', 'todelete@test.com'] } });
  await sequelize.close();
});

describe('Users API', () => {
  test('GET /api/users - should return users list', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('GET /api/users/:id - should return user by id', async () => {
    const res = await request(app)
      .get(`/api/users/${testUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(testUserId);
    expect(res.body.email).toBe('testuser@test.com');
  });

  test('POST /api/users - should create new user', async () => {
    const workerRole = await Role.findOne({ where: { name: 'worker' } });
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: 'newuser@test.com',
        password: 'password123',
        fullName: 'New User',
        roleId: workerRole.id,
        isActive: true
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toBe('newuser@test.com');
  });

  test('PUT /api/users/:id - should update user', async () => {
    const res = await request(app)
      .put(`/api/users/${testUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ fullName: 'Updated Name' });
    expect(res.statusCode).toBe(200);
    expect(res.body.fullName).toBe('Updated Name');
  });

  test('DELETE /api/users/:id - should delete user', async () => {
    const workerRole = await Role.findOne({ where: { name: 'worker' } });
    const createRes = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: 'todelete@test.com',
        password: 'password123',
        fullName: 'To Delete',
        roleId: workerRole.id,
        isActive: true
      });
    const userId = createRes.body.id;

    const deleteRes = await request(app)
      .delete(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(deleteRes.statusCode).toBe(204);
  });
});