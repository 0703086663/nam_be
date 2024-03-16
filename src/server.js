import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connect } from 'http2';
import connectToDB from './utils/connectDatabase.js';

// Configuring environment variables
import app from './app.js';

dotenv.config();

// Handling unhandled rejections
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);

  process.exit(1);
});

const conn = connectToDB();

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Handling unhandled rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);

  // Calling server.close() will give the server time to finish all the requests that are still pending or being handled at the moment
  // then it will close the server and exit the application
  server.close(() => {
    process.exit(1);
  });
});
