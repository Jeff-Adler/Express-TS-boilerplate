import { TestFactory } from '../../../utils/tests/factory';

describe('Testing Auth component', () => {
  let factory: TestFactory = new TestFactory();

  beforeAll(async () => {
    await factory.init();
  });

  afterAll(async () => {
    await factory.close();
  });

  describe('POST /login', () => {
    test.todo('responds with 200 status if valid credentials are passed');

    test('responds with 400 status if invalid credentials are passed', async () => {
      const result = await factory.app.post('/auth/login').send({});

      expect(result.status).toBe(400);
      expect(result.text).toBe('Request body lacked fields: email and/or password');
    });

    test('responds with 401 status if invalid credentials are passed', async () => {
      const result = await factory.app.post('/auth/login').send({
        email: 'invalidemail@admin.com',
        password: 'invalid_password',
      });

      expect(result.status).toBe(401);
      // expect(result.text).toBe('Request body lacked fields: email and/or password');
    });
  });
});
