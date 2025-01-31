import mongoose from 'mongoose';
import { app } from './app';
import { Server } from 'socket.io';
import { SocketService } from './socket/socket.service';
import fs from 'fs';
import https from 'https';
import { getCorsOptions } from './utils';
import { config } from './config/config';
import { initConfig } from './utils/config.utils';

initConfig();

const privateKey = fs.readFileSync(config.ssl.keyPath, 'utf8');
const certificate = fs.readFileSync(config.ssl.certPath, 'utf8');
const httpsOptions = { key: privateKey, cert: certificate };
const port = config.port;
const dbUrl: string = `mongodb://${config.database.host}:${config.database.port}/${config.database.name}`;

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
