import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, `../config/${process.env.ENVIRONMENT}.env`) });

import 'reflect-metadata';
import { createConnection } from 'typeorm';

import express from 'express';
import { App } from './app';

import { Logger } from './lib/logger';

(async function main() {
  try {
    // Initialize database connection
    Logger.debug('Initializing ORM connection...');
    const connection = await createConnection(`${process.env.CONNECTION_TYPE}`);

    // Initialize Express app
    const app: express.Application = new App().app;

    Logger.error('This is an error log');
    Logger.warn('This is a warn log');
    Logger.info('This is a info log');
    Logger.http('This is a http log');
    Logger.debug('This is a debug log');

    // Initialize Server
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
      Logger.debug(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.log(err);
  }
})();
