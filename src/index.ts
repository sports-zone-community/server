import mongoose from 'mongoose';
import { app } from './app';
import { Server } from 'socket.io';
import { SocketService } from './socket/socket.service';
import fs from 'fs';
import https from 'https';
import { getCorsOptions, initConfig } from './utils';
import { config } from './config/config';
import http from 'http';

initConfig();

const port = config.port;
const dbAuth =
  config.environment === 'production'
    ? `${config.database.username}:${encodeURIComponent(config.database.password)}@`
    : '';

const dbUrl: string = `mongodb://${dbAuth}${config.database.host}:${config.database.port}/${config.database.name}`;
let server: http.Server | https.Server;

if (config.environment === 'production') {
  const httpsOptions = {
    key: fs.readFileSync(config.ssl.keyPath, 'utf8'),
    cert: fs.readFileSync(config.ssl.certPath, 'utf8'),
  };
  server = https.createServer(httpsOptions, app);
} else {
  server = http.createServer(app);
}

const io = new Server(server, {
  cors: getCorsOptions(),
});

new SocketService(io);

(async () => {
  try {
    await mongoose.connect(dbUrl);
    console.log('Connected to MongoDB');

    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
})();
