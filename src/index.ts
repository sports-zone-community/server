import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { app } from './app';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { SocketService } from './socket/socket.service';

dotenv.config();

const port: string = process.env.PORT as string;
const dbUrl: string = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
console.log(dbUrl);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

new SocketService(io);

(async () => {
  try {
    await mongoose.connect(dbUrl);
    console.log('Connected to MongoDB');

    httpServer.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
})();
