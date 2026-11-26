import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { setupTestDB } from './setup.js';
import { User } from '../src/models/User.js';

describe('Authentication API Tests', () => {
  const { getApp } = setupTestDB();

  const sampleUser = {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'Password@123'
  };

  it('should successfully register a new normal user with role USER', async () => {
    const res = await request(getApp())
      .post('/api/auth/register')
      .send(sampleUser)
      .expect(201);

    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.email, sampleUser.email);
    assert.equal(res.body.data.user.role, 'USER');
    assert.ok(res.body.data.token, 'Token must be present in response body');
    assert.equal(res.body.data.user.password, undefined, 'Password hash must never be returned');

    // Verify cookie was set
    const cookies = res.headers['set-cookie'];
    assert.ok(cookies, 'Set-Cookie header must be present');
    assert.ok(cookies[0].includes('token='), 'Token cookie must be set');
  });

  it('should prevent privilege escalation (cannot register as ADMIN)', async () => {
    const res = await request(getApp())
      .post('/api/auth/register')
      .send({ ...sampleUser, role: 'ADMIN' })
      .expect(400);

    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Validation failed/);
  });

  it('should reject registration with duplicate email', async () => {
    await request(getApp()).post('/api/auth/register').send(sampleUser);

    const res = await request(getApp())
      .post('/api/auth/register')
      .send(sampleUser)
      .expect(400);

    assert.equal(res.body.success, false);
    assert.match(res.body.message, /already exists/i);
  });

  it('should successfully login an existing user', async () => {
    await request(getApp()).post('/api/auth/register').send(sampleUser);

    const res = await request(getApp())
      .post('/api/auth/login')
      .send({ email: sampleUser.email, password: sampleUser.password })
      .expect(200);

    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.email, sampleUser.email);
    assert.ok(res.body.data.token);
  });

  it('should reject login with wrong password', async () => {
    await request(getApp()).post('/api/auth/register').send(sampleUser);

    const res = await request(getApp())
      .post('/api/auth/login')
      .send({ email: sampleUser.email, password: 'WrongPassword' })
      .expect(401);

    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Invalid email or password/i);
  });

  it('should retrieve current authenticated user via /api/auth/me', async () => {
    const regRes = await request(getApp())
      .post('/api/auth/register')
      .send(sampleUser);

    const token = regRes.body.data.token;

    const meRes = await request(getApp())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    assert.equal(meRes.body.success, true);
    assert.equal(meRes.body.data.email, sampleUser.email);
    assert.equal(meRes.body.data.role, 'USER');
  });

  it('should reject unauthenticated request to /api/auth/me', async () => {
    const res = await request(getApp())
      .get('/api/auth/me')
      .expect(401);

    assert.equal(res.body.success, false);
  });
});
