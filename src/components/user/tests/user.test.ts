import { TestFactory } from '../../../utils/testing/factory';
import { doesNotThrow } from 'assert';

describe('Test User component', () => {
  let factory: TestFactory = new TestFactory();

  let token: string;

  beforeAll(async (done) => {
    await factory.init();
    //authentication to get auth token
    const result = await factory.app.post('/auth/login').send({
      email: 'admin@admin.com',
      password: 'admin_password',
    });

    token = result.body.token;
    done();
  });

  afterAll(async () => {
    await factory.close();
  });

  describe('GET /users/', () => {
    test('returns 200 status for valid request', async (done) => {
      console.log(token);
      const result = await factory.app.get('/users/').send({ Authorization: `Bearer ${token}` });
      console.log(result.text);
      expect(result.status).toBe(200);
      // expect(result.body).toContain('token');
      done();
    });

    test.todo('returns all users');

    test.todo('returns 400 error if invliad request is sent');

    describe('GET /users/ query params', () => {
      test.todo('?role=USER returns only users with USER role');

      test.todo('?orderBy=createdAt:DESC returns users in reverse creation order');

      test.todo('?take=3 returns 3 users');

      test.todo('?skip=3 skips 3 users');
    });
  });
});
