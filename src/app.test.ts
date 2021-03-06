import 'reflect-metadata';

import request from 'supertest';
import { TestFactory } from './factory';

//Need to create default connection to database and server
describe('Test that server is running', () => {
  let factory: TestFactory;

  beforeAll(async () => {
    factory = new TestFactory();
    await factory.init();
  });

  afterAll(async () => {
    await factory.close();
  });

  it('Request / should return "Server is running!"', async () => {
    const result = await request(factory.app).get('/').send();

    expect(result.status).toBe(200);
    expect(result.text).toBe('Server is running!');
  });
});
