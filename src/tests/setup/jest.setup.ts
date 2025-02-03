import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { config } from '../../config/config';
import { initConfig } from '../../utils';

dotenv.config({ path: '.env.test' });
initConfig();

const dbUrl: string = `mongodb://${config.database.host}:${config.database.port}/${config.database.name}`;

beforeAll(async () => {
  try {
    await mongoose.connect(dbUrl);
    console.log('Connected to test database');
  } catch (error) {
    console.error('Error connecting to test database:', error);
    process.exit(1);
  }
});

afterAll(async () => {
  try {
    await mongoose.connection.close();

    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
    process.exit(1);
  }
});

afterEach(async () => {
  console.log('Clearing all collections');
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
