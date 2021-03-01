import request from 'supertest';
import { App } from './app';

describe('Test Server', () => {
  it('Request / should return "Server is running!"', async () => {
    const result = await request(App).get('/').send();

    expect(result.status).toBe(200);
    expect(result.body.data).toBe('Server is running!');
  });
});
