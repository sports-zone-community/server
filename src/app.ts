import express, { Application } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import cors from 'cors';
import chatRoutes from './routes/chatRoutes';
import groupRoutes from './routes/groupRoutes';

dotenv.config();

const app: Application = express();

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/chats', chatRoutes);
app.use('/groups', groupRoutes);

export default app;
