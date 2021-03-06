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
    test('responds with 200 status if valid credentials are passed');

    test('responds with 401 status if invalid credentials are passed');
  });
});
