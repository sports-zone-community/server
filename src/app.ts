import express, { Application } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import { authRouter, chatRouter, groupRouter, postRouter } from './routes';
import { authMiddleware, errorMiddleware, loggerMiddleware } from './middlewares';
import { getCorsOptions } from './utils';

dotenv.config();

export const app: Application = express();

app.use(cors(getCorsOptions()));

app.use(bodyParser.json());

app.use(loggerMiddleware);
app.use('/auth', authRouter);
app.use('/chats', chatRouter);
app.use('/groups', groupRouter);
app.use('/posts', authMiddleware, postRouter);

app.use(errorMiddleware);
