import request from 'supertest';
import express from 'express';
import { App } from './app';
import { createConnection, Connection } from 'typeorm';

describe('Test Server', () => {
  const app: express.Application = new App().app;
  let connection: Connection;
  beforeAll(async () => {
    // change these options
    connection = await createConnection({
      name: 'default',
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'test',
      password: 'test',
      database: 'test',
    });

    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  });

  afterAll(async () => {
    await connection.close();
  });

  it('Request / should return "Server is running!"', async () => {
    const result = await request(app).get('/').send();

    expect(result.status).toBe(200);
    expect(result.text).toBe('Server is running!');
  });
});
