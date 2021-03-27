import { TestFactory } from '../../../utils/testing/factory';

describe('Test Profile component', () => {
  let factory: TestFactory = new TestFactory();

  let token: string;

  beforeAll(async (done) => {
    await factory.init();

    const result = await factory.loginAdminUser();
    token = result.body.token;

    done();
  });

  afterAll(async (done) => {
    await factory.close();

    done();
  });

  describe('GET /profile/', () => {});
  describe('PATCH /profile/profile/update', () => {});
  // Make sure this does not get blocked by email uniqueness validation
  describe('PATCH /profile/change-password', () => {});
  describe('DELETE /profile/delete', () => {});
});
