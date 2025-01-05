import express, { Application } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import cors from 'cors';

dotenv.config();

const app: Application = express();

app.use(cors());

app.use(bodyParser.json());

app.use('/auth', authRoutes);

export default app;
