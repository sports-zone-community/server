import express, { Application } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { authRouter } from './routes';
import cors from 'cors';
import { errorMiddleware, loggerMiddleware } from './middlewares';
import { chatRouter } from './routes/chat.router';
import { groupRouter } from './routes/group.router';
import { getCorsOptions } from './utils';

dotenv.config();

export const app: Application = express();

app.use(cors(getCorsOptions()));

app.use(bodyParser.json());

app.use(loggerMiddleware);
app.use('/auth', authRouter);
app.use('/chats', chatRouter);
app.use('/groups', groupRouter);

app.use(errorMiddleware);
