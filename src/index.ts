import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { app } from './app';
import { Server } from 'socket.io';
import { SocketService } from './socket/socket.service';
import fs from 'fs';
import https from 'https';
import { getCorsOptions } from './utils';

dotenv.config();

const privateKey = fs.readFileSync(process.env.SSL_KEY_PATH as string, 'utf8');
const certificate = fs.readFileSync(process.env.SSL_CERT_PATH as string, 'utf8');
const httpsOptions = { key: privateKey, cert: certificate };

const port: string = process.env.PORT as string;
const dbUrl: string = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const httpsServer = https.createServer(httpsOptions, app);
const io = new Server(httpsServer, {
  cors: getCorsOptions(),
});

new SocketService(io);

(async () => {
  try {
    await mongoose.connect(dbUrl);
    console.log('Connected to MongoDB');

    httpsServer.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
})();
