import { TestFactory } from '../../../utils/testing/factory';

describe('Test User component', () => {
  let factory: TestFactory = new TestFactory();

  beforeAll(async () => {
    await factory.init();
  });

  afterAll(async () => {
    await factory.close();
  });

  describe('GET /users/', () => {
    test.todo('returns 200 status for valid request');

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
