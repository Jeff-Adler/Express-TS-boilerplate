import { TestFactory } from '../../../utils/tests/factory';
import { doesNotThrow } from 'assert';

describe('Testing Auth component', () => {
  let factory: TestFactory = new TestFactory();

  beforeAll(async () => {
    await factory.init();
  });

  afterAll(async () => {
    await factory.close();
  });

  describe('POST /login', () => {
    test('responds with 200 status if valid credentials are passed', async (done) => {
      const result = await factory.app.post('/auth/login').send({
        email: 'admin@admin.com',
        password: 'admin_password',
      });

      expect(result.status).toBe(200);
      expect(Object.keys(result.body)).toContain('token');
      done();
    });

    test('responds with 400 status if login request body does not include fields: email and/or password', async (done) => {
      const result = await factory.app.post('/auth/login').send({});

      expect(result.status).toBe(400);
      expect(result.text).toBe('Request body lacked fields: email and/or password');
      done();
    });

    test('responds with 401 status if invalid password is passed', async (done) => {
      const result = await factory.app.post('/auth/login').send({
        email: 'admin@admin.com',
        password: 'invalid_password',
      });

      expect(result.status).toBe(401);
      expect(result.text).toBe('Invalid password');
      done();
    });

    test('responds with 401 status if invalid email is passed', async (done) => {
      const result = await factory.app.post('/auth/login').send({
        email: 'invalidemailaddress@admin.com',
        password: 'admin_password',
      });

      expect(result.status).toBe(401);
      expect(result.text).toBe('User with email address "invalidemailaddress@admin.com" not found');
      done();
    });
  });
});
