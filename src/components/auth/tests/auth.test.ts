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

    test('responds with 400 status if login request body does not include fields: email and/or password', (done) => {
      factory.app.post('/auth/login').send({}).set('Accept', 'application/json').expect(400, done);

      // expect(result.status).toBe(400);
      // expect(result.text).toBe('Request body lacked fields: email and/or password');
    });

    // test('responds with 401 status if invalid password is passed', (done) => {
    //   factory.app
    //     .post('/auth/login')
    //     .send({
    //       email: 'admin@admin.com',
    //       password: 'invalid_password',
    //     })
    //     .set('Accept', 'application/json')
    //     .expect(401, done);

    //   // expect(result.status).toBe(401);
    //   // Uncomment once database seeding is setup:
    //   // expect(result.text).toBe('Invalid password');
    // });

    // test('responds with 401 status if invalid email is passed', async () => {
    //   const result = await factory.app.post('/auth/login').send({
    //     email: 'invalidemailaddress@admin.com',
    //     password: 'admin_password',
    //   });

    //   // console.log(JSON.stringify(result));

    //   expect(result.status).toBe(401);
    //   // expect(result.text).toBe('User with email address "invalidemailaddress@admin.com" not found');
    // });
  });
});
