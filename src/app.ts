import express, { Application } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.router';
import cors from 'cors';

dotenv.config();

const app: Application = express();

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};

app.use(cors(corsOptions));

app.options('*', cors(corsOptions));

app.use(bodyParser.json());

app.use('/auth', authRoutes);

export default app;
