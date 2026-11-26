import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../src/models/User.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/support_ticket_system';
    await mongoose.connect(mongoUri);

    const adminName = process.env.ADMIN_NAME || 'Super Admin';
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@helpdesk.com').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      if (existingAdmin.role !== 'ADMIN') {
        existingAdmin.role = 'ADMIN';
        await existingAdmin.save();
      }
      console.log(`Admin user already exists (${adminEmail}).`);
      process.exit(0);
    }

    const newAdmin = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'ADMIN'
    });

    console.log(`Admin account initialized: ${newAdmin.email}`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed administrator account:', error.message);
    process.exit(1);
  }
};

seedAdmin();
