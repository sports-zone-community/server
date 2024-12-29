import express, { Application } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();
const port: string = process.env.PORT as string;
const dbUrl: string = process.env.DB_URL as string;

mongoose
  .connect(dbUrl)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

app.use(bodyParser.json());

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
