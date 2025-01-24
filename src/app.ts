import express, { Application } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import { chatRouter } from './routes/chat.router';
import { groupRouter } from './routes/group.router';
import { authRouter } from './routes/auth.router';
dotenv.config();

const app: Application = express();

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use('/auth', authRouter);
app.use('/chats', chatRouter);
app.use('/groups', groupRouter);

export default app;
