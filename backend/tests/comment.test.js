import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { setupTestDB } from './setup.js';
import { User } from '../src/models/User.js';

describe('Ticket Comments API Tests', () => {
  const { getApp } = setupTestDB();

  let userToken, otherUserToken, adminToken;
  let user1, user2, admin;
  let ticketId;

  const initData = async () => {
    user1 = await User.create({
      name: 'Ticket Owner',
      email: 'owner@example.com',
      password: 'Password@123',
      role: 'USER'
    });

    user2 = await User.create({
      name: 'Intruder User',
      email: 'intruder@example.com',
      password: 'Password@123',
      role: 'USER'
    });

    admin = await User.create({
      name: 'Support Admin',
      email: 'admin@helpdesk.com',
      password: 'AdminPassword@123',
      role: 'ADMIN'
    });

    const loginRes1 = await request(getApp())
      .post('/api/auth/login')
      .send({ email: 'owner@example.com', password: 'Password@123' });
    userToken = loginRes1.body.data.token;

    const loginRes2 = await request(getApp())
      .post('/api/auth/login')
      .send({ email: 'intruder@example.com', password: 'Password@123' });
    otherUserToken = loginRes2.body.data.token;

    const adminLogin = await request(getApp())
      .post('/api/auth/login')
      .send({ email: 'admin@helpdesk.com', password: 'AdminPassword@123' });
    adminToken = adminLogin.body.data.token;

    const ticketRes = await request(getApp())
      .post('/api/tickets')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Billing issue with last invoice',
        description: 'Charged twice for subscription.',
        category: 'Billing'
      });

    ticketId = ticketRes.body.data._id;
  };

  it('should allow ticket owner to add comment to their ticket', async () => {
    await initData();

    const res = await request(getApp())
      .post(`/api/tickets/${ticketId}/comments`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ message: 'Here is the screenshot of the transaction.' })
      .expect(201);

    assert.equal(res.body.success, true);
    assert.equal(res.body.data.message, 'Here is the screenshot of the transaction.');
    assert.equal(res.body.data.authorRole, 'USER');
  });

  it('should allow admin to comment on any ticket', async () => {
    await initData();

    const res = await request(getApp())
      .post(`/api/tickets/${ticketId}/comments`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ message: 'We have refunded the duplicate charge. Please verify.' })
      .expect(201);

    assert.equal(res.body.success, true);
    assert.equal(res.body.data.authorRole, 'ADMIN');
  });

  it('should prevent non-owner user from commenting on another user ticket (403)', async () => {
    await initData();

    const res = await request(getApp())
      .post(`/api/tickets/${ticketId}/comments`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({ message: 'Unauthorized comment' })
      .expect(403);

    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Forbidden/);
  });

  it('should prevent non-owner user from reading comments on another user ticket (403)', async () => {
    await initData();

    const res = await request(getApp())
      .get(`/api/tickets/${ticketId}/comments`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .expect(403);

    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Forbidden/);
  });
});
