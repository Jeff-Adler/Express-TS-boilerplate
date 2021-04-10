import 'reflect-metadata';
import { createConnection } from 'typeorm';

import express from 'express';
import { App } from './app';

(async function main() {
  try {
    // Initialize database connection

    console.log('Initializing ORM connection...');
    // const connection = await createConnection('development');

    const connection = await createConnection({
      type: 'postgres',
      host: '127.0.0.1',
      port: 5432,
      username: 'jeff',
      password: '',
      database: 'test_db',
      synchronize: true,
      logging: true,
      entities: ['build/components/**/model.js'],
      migrations: ['build/migration/**/*.js'],
      cli: {
        migrationsDir: 'build/migration',
      },
    });

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
