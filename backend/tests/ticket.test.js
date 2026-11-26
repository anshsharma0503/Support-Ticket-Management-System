import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { setupTestDB } from './setup.js';
import { User } from '../src/models/User.js';

describe('Ticket Management API Tests', () => {
  const { getApp } = setupTestDB();

  let userToken, user2Token, adminToken;
  let user1, user2, adminUser;

  const createUsersAndTokens = async () => {
    user1 = await User.create({
      name: 'User One',
      email: 'user1@example.com',
      password: 'Password@123',
      role: 'USER'
    });

    user2 = await User.create({
      name: 'User Two',
      email: 'user2@example.com',
      password: 'Password@123',
      role: 'USER'
    });

    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'AdminPassword@123',
      role: 'ADMIN'
    });

    const loginRes1 = await request(getApp())
      .post('/api/auth/login')
      .send({ email: 'user1@example.com', password: 'Password@123' });
    userToken = loginRes1.body.data.token;

    const loginRes2 = await request(getApp())
      .post('/api/auth/login')
      .send({ email: 'user2@example.com', password: 'Password@123' });
    user2Token = loginRes2.body.data.token;

    const adminLogin = await request(getApp())
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'AdminPassword@123' });
    adminToken = adminLogin.body.data.token;
  };

  it('should allow user to create a ticket with default status OPEN', async () => {
    await createUsersAndTokens();

    const res = await request(getApp())
      .post('/api/tickets')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Network connectivity is failing',
        description: 'Unable to reach the server from subnets. Please investigate.',
        category: 'Technical Issue',
        priority: 'HIGH'
      })
      .expect(201);

    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'OPEN');
    assert.equal(res.body.data.priority, 'HIGH');
    assert.equal(res.body.data.createdBy._id.toString(), user1._id.toString());
  });

  it('should prevent non-admin from modifying status during creation', async () => {
    await createUsersAndTokens();

    const res = await request(getApp())
      .post('/api/tickets')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Tampering test',
        description: 'Attempting to inject resolved status upon creation',
        category: 'Billing',
        status: 'RESOLVED'
      })
      .expect(400);

    assert.equal(res.body.success, false);
  });

  it('should retrieve only the authenticated user tickets via /api/tickets/my', async () => {
    await createUsersAndTokens();

    // User 1 creates 2 tickets
    await request(getApp())
      .post('/api/tickets')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'User 1 Ticket 1',
        description: 'First ticket created by user 1',
        category: 'Account'
      });

    await request(getApp())
      .post('/api/tickets')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'User 1 Ticket 2',
        description: 'Second ticket created by user 1',
        category: 'Billing'
      });

    // User 2 creates 1 ticket
    await request(getApp())
      .post('/api/tickets')
      .set('Authorization', `Bearer ${user2Token}`)
      .send({
        title: 'User 2 Ticket',
        description: 'Ticket created by user 2',
        category: 'Technical Issue'
      });

    // User 1 requests their tickets
    const res = await request(getApp())
      .get('/api/tickets/my')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    assert.equal(res.body.success, true);
    assert.equal(res.body.data.length, 2);
    assert.equal(res.body.meta.total, 2);
  });

  it('should prevent user 2 from reading user 1 ticket details (403 Forbidden)', async () => {
    await createUsersAndTokens();

    const ticketRes = await request(getApp())
      .post('/api/tickets')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Private Ticket',
        description: 'Confidential details about my account',
        category: 'Account'
      });

    const ticketId = ticketRes.body.data._id;

    // User 2 tries to access User 1's ticket
    const res = await request(getApp())
      .get(`/api/tickets/${ticketId}`)
      .set('Authorization', `Bearer ${user2Token}`)
      .expect(403);

    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Forbidden/);
  });

  it('should allow user to edit their own ticket while status is OPEN', async () => {
    await createUsersAndTokens();

    const ticketRes = await request(getApp())
      .post('/api/tickets')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Typo in original ticket',
        description: 'Description needs correction here.',
        category: 'General Inquiry'
      });

    const ticketId = ticketRes.body.data._id;

    const updateRes = await request(getApp())
      .patch(`/api/tickets/${ticketId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Corrected Title for Ticket',
        description: 'Updated description with more thorough information.'
      })
      .expect(200);

    assert.equal(updateRes.body.success, true);
    assert.equal(updateRes.body.data.title, 'Corrected Title for Ticket');
  });

  it('should prevent user from editing ticket once status is IN_PROGRESS or RESOLVED', async () => {
    await createUsersAndTokens();

    const ticketRes = await request(getApp())
      .post('/api/tickets')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Ticket to be resolved',
        description: 'Processing this ticket through admin',
        category: 'Technical Issue'
      });

    const ticketId = ticketRes.body.data._id;

    // Admin moves it to IN_PROGRESS
    await request(getApp())
      .patch(`/api/admin/tickets/${ticketId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'IN_PROGRESS' })
      .expect(200);

    // User tries to edit
    const editRes = await request(getApp())
      .patch(`/api/tickets/${ticketId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Illegal edit attempt' })
      .expect(400);

    assert.equal(editRes.body.success, false);
    assert.match(editRes.body.message, /only be edited while status is OPEN/i);
  });

  it('should allow admin to view all tickets and update priority and status', async () => {
    await createUsersAndTokens();

    const ticketRes = await request(getApp())
      .post('/api/tickets')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Server crash on checkout',
        description: 'Critical bug encountered when proceeding to checkout',
        category: 'Technical Issue'
      });

    const ticketId = ticketRes.body.data._id;

    // Admin updates priority
    const prioRes = await request(getApp())
      .patch(`/api/admin/tickets/${ticketId}/priority`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ priority: 'URGENT' })
      .expect(200);

    assert.equal(prioRes.body.data.priority, 'URGENT');

    // Admin updates status
    const statRes = await request(getApp())
      .patch(`/api/admin/tickets/${ticketId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'RESOLVED' })
      .expect(200);

    assert.equal(statRes.body.data.status, 'RESOLVED');
  });
});
