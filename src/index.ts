import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, `../config/${process.env.ENVIRONMENT}.env`) });

import 'reflect-metadata';
import { createConnection } from 'typeorm';

import express from 'express';
import { App } from './app';

(async function main() {
  try {
    // Initialize database connection
    console.log('Initializing ORM connection...');
    const connection = await createConnection(`${process.env.CONNECTION_TYPE}`);

    // Initialize Express app
    const app: express.Application = new App().app;

    // Initialize Server
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.log(err);
  }
})();
