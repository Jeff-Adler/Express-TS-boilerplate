import { TestFactory } from './utils/tests/factory';

describe('Test that server is running', () => {
  let factory: TestFactory = new TestFactory();

  beforeAll(async () => {
    await factory.init();
  });

  afterAll(async () => {
    await factory.close();
  });

  test('Request / should return "Server is running!"', async () => {
    const result = await factory.app.get('/').send();

    expect(result.status).toBe(200);
    expect(result.text).toBe('Server is running!');
  });
});
