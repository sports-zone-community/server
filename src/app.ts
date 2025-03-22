import express, { Application } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import {
  adminRouter,
  authRouter,
  chatRouter,
  commentRouter,
  groupRouter,
  postRouter,
  searchRouter,
} from './routes';
import { authMiddleware, errorMiddleware, loggerMiddleware } from './middlewares';
import { getCorsOptions } from './utils';
import { userRouter } from './routes/user.router';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { specs } from './swagger';
import { footballRouter } from './routes/football.router';

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
app.use('/football', authMiddleware, footballRouter);
app.use('/search', authMiddleware, searchRouter);
app.use('/admin', authMiddleware, adminRouter);

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(specs));

app.use(errorMiddleware);
