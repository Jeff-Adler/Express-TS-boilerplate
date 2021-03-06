import 'reflect-metadata';
import { createConnection, Connection } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

// // Set env to test
// process.env.NODE_ENV = 'test';

// // Set env variables from .env file
// import { config } from 'dotenv';
// config();

import express from 'express';
import { App } from './app';

import supertest from 'supertest';

/**
 * TestFactory
 * - Loaded in each unit test
 * - Starts server and DB connection
 */

export class TestFactory {
  private _connection!: Connection;
  private _app!: express.Application;

  //breakthrough: if I name the connection in ormconfig, even npm start breaks. Its looking for default connection

  // DB connection options
  private options: PostgresConnectionOptions = {
    name: 'testing',
    type: 'postgres',
    host: '127.0.0.1',
    port: 5432,
    username: 'jeff',
    password: '',
    database: 'mock_db',
    dropSchema: true,
    synchronize: true,
    logging: false,
    migrationsRun: true,
    entities: ['src/components/**/model.ts'],
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
    this._connection = await createConnection(this.options);

    this._app = new App().app;

    const PORT = process.env.PORT || 8080;
    this._app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  }

  /**
   * Close server and DB connection
   */
  public async close(): Promise<void> {
    this._connection.close();
  }
}
