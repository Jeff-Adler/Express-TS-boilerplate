import { TestFactory } from './utils/testing/factory';

describe('Test that server is running', () => {
  let factory: TestFactory = new TestFactory();

  beforeAll(async () => {
    await factory.init();
  });

  afterAll(async () => {
    await factory.close();
  });

  describe('GET /', () => {
    test('responds with 200 status if valid request url is sent', async (done) => {
      const result = await factory.app.get('/').send();

      expect(result.status).toBe(200);
      expect(result.text).toBe('Server is running!');
      done();
    });

    test('responds with 404 status if invalid request url is sent', async (done) => {
      const result = await factory.app.get('/InvalidRoute').send();

      expect(result.status).toBe(400);
      expect(result.text).toBe('404');
      done();
    });
  });
});
