import 'reflect-metadata';
import 'source-map-support/register';
import 'module-alias/register';

// // Set env to test
// process.env.NODE_ENV = 'test';

// // Set env variables from .env file
// import { config } from 'dotenv';
// config();

import { createConnection, ConnectionOptions, Connection } from 'typeorm';
import { createServer, Server as HttpServer } from 'http';

import express from 'express';
import supertest from 'supertest';

// import { env } from '@config/globals';

import { App } from './app';

/**
 * TestFactory
 * - Loaded in each unit test
 * - Starts server and DB connection
 */

export class TestFactory {
  private _app!: express.Application;
  private _connection!: Connection;

  // DB connection options
  private options: ConnectionOptions = {
    type: 'sqljs',
    database: new Uint8Array(),
    location: 'database',
    logging: false,
    synchronize: true,
    entities: ['dist/api/components/**/model.js'],
  };

  public get app(): supertest.SuperTest<supertest.Test> {
    return supertest(this._app);
  }

  public get connection(): Connection {
    return this._connection;
  }

  /**
   * Connect to DB and start server
   */
  public async init(): Promise<void> {
    this._app = new App().app;

    const PORT = process.env.PORT || 8080;
    this._app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
    this._connection = await createConnection(this.options);
  }

  /**
   * Close server and DB connection
   */
  public async close(): Promise<void> {
    this._connection.close();
  }
}
