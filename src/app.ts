import express, { Application } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { authRouter } from './routes';
import cors from 'cors';
import { errorMiddleware } from './middlewares/error.middleware';

dotenv.config();

export const app: Application = express();

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};

app.use(cors(corsOptions));

app.options('*', cors(corsOptions));

app.use(bodyParser.json());

app.use('/auth', authRouter);

app.use(errorMiddleware);
