import express, { Application } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import { authRouter, chatRouter, commentRouter, groupRouter, postRouter } from './routes';
import { authMiddleware, errorMiddleware, loggerMiddleware } from './middlewares';
import { getCorsOptions } from './utils';
import { userRouter } from './routes/user.router';
import cookieParser from 'cookie-parser';

dotenv.config();

export const app: Application = express();

app.use(cors(getCorsOptions()));

app.use(bodyParser.json());
app.use(cookieParser());

app.use(loggerMiddleware);
app.use('/uploads', express.static('uploads'));
app.use('/auth', authRouter);
app.use('/users', authMiddleware, userRouter);
app.use('/chats', authMiddleware, chatRouter);
app.use('/groups', authMiddleware, groupRouter);
app.use('/posts', authMiddleware, postRouter);
app.use('/comments', authMiddleware, commentRouter);

app.use(errorMiddleware);
