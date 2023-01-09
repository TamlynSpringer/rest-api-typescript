import express from "express";
import http from 'http';
import mongoose from "mongoose";
import { config } from './config/config';
import authorRoutes from './routes/Author';
import bookRoutes from './routes/Book';

const router = express();

// Connect to Mongo

mongoose
.connect(config.mongo.url, { retryWrites: true, w: 'majority' })
.then(() => {
  console.log('Connected to Mongo')
})
.catch(error => {
  console.log(error)
});

// Only start the server if Mongo connects

const StartServer = () => {
  router.use((req, res, next) => {
    console.log(`Incoming -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}]`);
    res.on('finish', () => {
      // Log the response
      console.log(`Outgoing -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}] - Status: [${res.statusCode}]`);
    });
    next();
  });
  router.use(express.urlencoded({ extended: true }));
  router.use(express.json());
  // API rules
  router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method == 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
      return res.status(200).json({});
    }
    next();
  });
  // Routes
  router.use('/api/authors', authorRoutes)
  router.use('/api/books', bookRoutes);
  // Check API is working properly
  router.get('/api/check', (req, res, next) => res.status(200).json({ message: 'API working' }));
  // Error handling
  router.use((req, res, next) => {
    const error = new Error('Not found');
    console.log(error);
    return res.status(404).json({ message: error.message })
  });
  // Server
  http.createServer(router).listen(config.server.port, () => {
    console.log(`Sever is running on port ${config.server.port}`);
  })
};

StartServer();