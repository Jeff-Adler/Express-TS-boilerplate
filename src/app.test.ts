import request from 'supertest';
import express from 'express';
import { App } from './app';
import { createConnection } from 'typeorm';

describe('Test Server', () => {
  it('Request / should return "Server is running!"', async () => {
    console.log('Initializing ORM connection...');
    await createConnection();

    const app: express.Application = new App().app;
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    const result = await request(app).get('/').send();

    expect(result.status).toBe(200);
    expect(result.text).toBe('Server is running!');
  });
});
