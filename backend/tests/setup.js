import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { before, after, afterEach } from 'node:test';
import { createApp } from '../src/app.js';

let mongoServer;
let appInstance;

export const setupTestDB = () => {
  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    appInstance = createApp();
  });

  after(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  return {
    getApp: () => appInstance
  };
};
