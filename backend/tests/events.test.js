import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { setupTestDB } from './setup.js';
import { User } from '../src/models/User.js';
import { ActivityLog } from '../src/models/ActivityLog.js';

describe('Event-Driven Architecture & Activity Log Tests', () => {
  const { getApp } = setupTestDB();

  let userToken, adminToken;
  let user, admin;

  const initData = async () => {
    user = await User.create({
      name: 'Event Tester',
      email: 'tester@example.com',
      password: 'Password@123',
      role: 'USER'
    });

    admin = await User.create({
      name: 'Admin Tester',
      email: 'admin.event@example.com',
      password: 'AdminPassword@123',
      role: 'ADMIN'
    });

    const userLogin = await request(getApp())
      .post('/api/auth/login')
      .send({ email: 'tester@example.com', password: 'Password@123' });
    userToken = userLogin.body.data.token;

    const adminLogin = await request(getApp())
      .post('/api/auth/login')
      .send({ email: 'admin.event@example.com', password: 'AdminPassword@123' });
    adminToken = adminLogin.body.data.token;
  };

  it('should record TICKET_CREATED activity log upon ticket creation', async () => {
    await initData();

    const ticketRes = await request(getApp())
      .post('/api/tickets')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Event Driven System Verification',
        description: 'Verifying that EventEmitter asynchronously logs activities',
        category: 'Technical Issue'
      })
      .expect(201);

    const ticketId = ticketRes.body.data._id;

    // Small delay to allow asynchronous event listener to complete MongoDB write
    await new Promise((resolve) => setTimeout(resolve, 300));

    const log = await ActivityLog.findOne({ ticket: ticketId, action: 'TICKET_CREATED' });
    assert.ok(log, 'TICKET_CREATED activity log must be stored in database');
    assert.equal(log.actor.toString(), user._id.toString());
    assert.equal(log.actorRole, 'USER');
  });

  it('should record STATUS_CHANGED and TICKET_RESOLVED activity logs when status is resolved', async () => {
    await initData();

    const ticketRes = await request(getApp())
      .post('/api/tickets')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Status change activity test',
        description: 'Testing activity log persistence on status transition',
        category: 'General Inquiry'
      });

    const ticketId = ticketRes.body.data._id;

    await request(getApp())
      .patch(`/api/admin/tickets/${ticketId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'RESOLVED' })
      .expect(200);

    // Allow async event handler to write to DB
    await new Promise((resolve) => setTimeout(resolve, 300));

    const statusLog = await ActivityLog.findOne({ ticket: ticketId, action: 'STATUS_CHANGED' });
    assert.ok(statusLog, 'STATUS_CHANGED log must exist');
    assert.equal(statusLog.metadata.previousStatus, 'OPEN');
    assert.equal(statusLog.metadata.newStatus, 'RESOLVED');

    const resolvedLog = await ActivityLog.findOne({ ticket: ticketId, action: 'TICKET_RESOLVED' });
    assert.ok(resolvedLog, 'TICKET_RESOLVED log must exist');
  });

  it('should record COMMENT_ADDED activity log when a comment is posted', async () => {
    await initData();

    const ticketRes = await request(getApp())
      .post('/api/tickets')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Comment event verification',
        description: 'Verify activity log on comment posting',
        category: 'Other'
      });

    const ticketId = ticketRes.body.data._id;

    await request(getApp())
      .post(`/api/tickets/${ticketId}/comments`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ message: 'New comment to trigger event' })
      .expect(201);

    await new Promise((resolve) => setTimeout(resolve, 300));

    const commentLog = await ActivityLog.findOne({ ticket: ticketId, action: 'COMMENT_ADDED' });
    assert.ok(commentLog, 'COMMENT_ADDED log must be recorded');
  });

  it('should allow admin to query activity logs through /api/admin/activity-logs', async () => {
    await initData();

    const res = await request(getApp())
      .get('/api/admin/activity-logs')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.meta);
  });
});
