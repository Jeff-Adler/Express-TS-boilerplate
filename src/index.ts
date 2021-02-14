import * as dotenv from 'dotenv';
dotenv.config({ path: './src/config/.env' });

import 'reflect-metadata';
import { createConnection } from 'typeorm';

import express from 'express';
import { App } from './app';

(async function main() {
  try {
    // Initialize database connection
    console.log('Initializing ORM connection...');
    await createConnection();

    // Initialize Express app
    const app: express.Application = new App().app;

    // Initialize Server
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () =>
      console.log(`Server is running on port ${process.env.PORT}`)
    );
  } catch (err) {
    console.log(err);
  }
})();
