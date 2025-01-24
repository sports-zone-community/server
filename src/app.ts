import express, { Application } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { authRouter } from './routes';
import cors from 'cors';
import { errorMiddleware, loggerMiddleware } from './middlewares';
import { chatRouter } from './routes/chat.router';
import { groupRouter } from './routes/group.router';

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

app.use('/auth', authRouter);

app.use(errorMiddleware);
