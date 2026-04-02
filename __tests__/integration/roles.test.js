const request = require('supertest');
const app = require('../../src/app');
const { sequelize, Role, Permission } = require('../../src/models');

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

describe('Roles API', () => {
  let roleId;

  test('POST /api/roles - should create role', async () => {
    const res = await request(app)
      .post('/api/roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `TestRole${Date.now()}`, description: 'Test role' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    roleId = res.body.id;
  });

  test('GET /api/roles - should list roles', async () => {
    const res = await request(app)
      .get('/api/roles')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/roles/:id - should get role by id', async () => {
    const res = await request(app)
      .get(`/api/roles/${roleId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(roleId);
  });

  test('PUT /api/roles/:id - should update role', async () => {
    const res = await request(app)
      .put(`/api/roles/${roleId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ description: 'Updated description' });
    expect(res.statusCode).toBe(200);
    expect(res.body.description).toBe('Updated description');
  });

  test('PUT /api/roles/:id/permissions - should set permissions', async () => {
    const perm = await Permission.findOne();
    const res = await request(app)
      .put(`/api/roles/${roleId}/permissions`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ permissionIds: [perm.id] });
    expect(res.statusCode).toBe(200);
    expect(res.body.permissions).toContainEqual(expect.objectContaining({ id: perm.id }));
  });

  test('DELETE /api/roles/:id - should delete role', async () => {
    const res = await request(app)
      .delete(`/api/roles/${roleId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(204);
  });
});