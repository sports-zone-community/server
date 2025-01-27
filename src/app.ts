import express, { Application } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { authRouter, chatRouter, groupRouter, postRouter } from './routes';
import cors from 'cors';
import { authMiddleware, errorMiddleware, loggerMiddleware } from './middlewares';

dotenv.config();

export const app: Application = express();

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST'],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use(loggerMiddleware);
app.use('/auth', authRouter);
app.use('/chats', chatRouter);
app.use('/groups', groupRouter);
app.use('/posts', authMiddleware, postRouter);

app.use(errorMiddleware);
