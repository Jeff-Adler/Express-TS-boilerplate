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

  describe('GET /profile/', () => {
    test('sends 200 response and id, email, and role fields of current user', async (done) => {
      const result = await factory.app.get(`/profile/`).set({ Authorization: `Bearer ${token}` });

      expect(result.status).toBe(200);
      expect(Object.keys(result.body)).toEqual(['id', 'email', 'role']);

      done();
    });
  });
  describe('PATCH /profile/profile/update', () => {});
  // Make sure this does not get blocked by email uniqueness validation
  describe('PATCH /profile/change-password', () => {});
  describe('DELETE /profile/delete', () => {});
});
