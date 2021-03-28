import { TestFactory } from '../../../utils/testing/factory';
import { User } from '../../user/model';
import { getConnection } from 'typeorm';

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
    test('sends 200 response and id, email, and role fields of current user if valid credentials are sent', async (done) => {
      const result = await factory.app.get(`/profile/`).set({ Authorization: `Bearer ${token}` });

      expect(result.status).toBe(200);
      expect(Object.keys(result.body)).toEqual(['id', 'email', 'role']);

      done();
    });

    test('sends 401 response if invalid credentials are sent', async (done) => {
      const result = await factory.app.get(`/profile/`).set({ Authorization: `Bearer ${token}InvalidChars` });

      expect(result.status).toBe(401);

      done();
    });
  });
  describe('PATCH /profile/update', () => {
    test('Patches permitted fields: email', async (done) => {
      // const
      // const seededUser: User = await factory.seedSingleUser();

      const newEmail = 'patchedEmail@test.com';

      const result = await factory.app
        .patch(`/profile/update`)
        .send({ email: newEmail })
        .set({ Authorization: `Bearer ${token}` });

      expect(result.status).toBe(201);
      expect(result.body.email).toEqual(newEmail);

      const currentUser = await factory.app.get(`/profile/`).set({ Authorization: `Bearer ${token}` });

      expect(currentUser.body.email).toBe(newEmail);

      done();
    });

    test('Patches permitted fields: password', async (done) => {
      const newPassword = 'patchedPassword';

      const result = await factory.app
        .patch(`/profile/update`)
        .send({ password: newPassword })
        .set({ Authorization: `Bearer ${token}` });

      expect(result.status).toBe(201);

      const patchedUser: User = await getConnection(process.env.CONNECTION_TYPE)
        .getRepository(User)
        .findOneOrFail({ email: seededUser.email });

      const hashedPatchedPassword = patchedUser.password;
      // Expect that updated password is hashed
      expect(hashedPatchedPassword).not.toBe(newPassword);
      // Expect that updated password is not equal to original password
      expect(hashedPatchedPassword).not.toEqual(seededUser.password);

      done();
    });

    test('Patches permitted fields: role', async (done) => {
      const seededUser: User = await factory.seedSingleUser();

      const newRole = 'ADMIN';

      const result = await factory.app
        .patch(`/users/${seededUser.id}`)
        .send({ role: newRole })
        .set({ Authorization: `Bearer ${token}` });

      expect(result.status).toBe(201);
      expect(result.body.role).toBe('ADMIN');

      const patchedUser: User = await getConnection(process.env.CONNECTION_TYPE)
        .getRepository(User)
        .findOneOrFail({ email: seededUser.email });

      expect(patchedUser.role).toBe('ADMIN');
      expect(patchedUser.role).not.toBe('USER');

      done();
    });

    test('Does not patch prohibited fields: id', async (done) => {
      const seededUser: User = await factory.seedSingleUser();

      //generate Id that is not currently used, to ensure is not due to Id already existing in db
      const newId = (await getOneMaxId()) + 1;

      const postPatchResult = await factory.app
        .patch(`/users/${seededUser.id}`)
        .send({ id: newId })
        .set({ Authorization: `Bearer ${token}` });

      expect(postPatchResult.status).toBe(400);
      expect(postPatchResult.text).toEqual('Field cannot be updated');

      const patchedUser: User = await getConnection(process.env.CONNECTION_TYPE)
        .getRepository(User)
        .findOneOrFail({ email: seededUser.email });

      expect(patchedUser.id).not.toEqual(newId);
      expect(patchedUser.id).toEqual(seededUser.id);

      done();
    });

    test('Does not patch prohibited fields: nonExistentField', async (done) => {
      const seededUser: User = await factory.seedSingleUser();

      const newInvalidField = 'invalid update';

      const result = await factory.app
        .patch(`/users/${seededUser.id}`)
        .send({ newInvalidField })
        .set({ Authorization: `Bearer ${token}` });

      expect(result.status).toBe(400);
      expect(result.text).toEqual('Field cannot be updated');

      done();
    });

    test('Return 409 if requested email already exists in the db', async (done) => {
      const seededUser: User = await factory.seedSingleUser();

      const users: User[] = await getConnection(process.env.CONNECTION_TYPE).getRepository(User).find({ role: 'USER' });
      // get random user from db
      const retrievedUser: User = users[Math.floor(Math.random() * users.length)];

      const result = await factory.app
        .patch(`/users/${seededUser.id}`)
        .send({ email: retrievedUser.email })
        .set({ Authorization: `Bearer ${token}` });

      expect(result.status).toBe(409);
      expect(result.text).toBe('email already in use');

      done();
    });
  });
  // Make sure this does not get blocked by email uniqueness validation
  describe('PATCH /profile/change-password', () => {});
  describe('DELETE /profile/delete', () => {});
});
