import { getConnection } from 'typeorm';

import { User } from '../../user/model';
import { TestFactory } from '../../../utils/testing/factory';
import { getOneMaxId } from '../../../utils/testing/helperFunctions';
import { profileTestsConstants } from './profile.test.constants';

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
    test('patches permitted fields: email', async (done) => {
      let result = await factory.app
        .patch(`/profile/update`)
        .send({ email: profileTestsConstants.NEW_EMAIL })
        .set({ Authorization: `Bearer ${token}` });

      expect(result.status).toBe(201);
      expect(result.body.email).toEqual(profileTestsConstants.NEW_EMAIL);

      const currentUser = await factory.app.get(`/profile/`).set({ Authorization: `Bearer ${token}` });

      expect(currentUser.body.email).toBe(profileTestsConstants.NEW_EMAIL);

      // Revert back to original email to be able to sign in with seeded user credentials for other tests
      result = await factory.app
        .patch(`/profile/update`)
        .send({ email: profileTestsConstants.ORIGINAL_EMAIL })
        .set({ Authorization: `Bearer ${token}` });

      expect(result.status).toBe(201);

      done();
    });

    test('user can login with patched email, cannot login with original email', async (done) => {
      let result = await factory.app
        .patch(`/profile/update`)
        .send({ email: profileTestsConstants.NEW_EMAIL })
        .set({ Authorization: `Bearer ${token}` });

      expect(result.status).toBe(201);
      expect(result.body.email).toEqual(profileTestsConstants.NEW_EMAIL);

      // Test that user cannot login with original email
      result = await factory.app.post('/auth/login').send({
        email: profileTestsConstants.ORIGINAL_EMAIL,
        password: profileTestsConstants.ORIGINAL_PASSWORD,
      });

      expect(result.status).toBe(401);

      // Test that user can sign in with new email
      result = await factory.app.post('/auth/login').send({
        email: profileTestsConstants.NEW_EMAIL,
        password: profileTestsConstants.ORIGINAL_PASSWORD,
      });

      expect(result.status).toBe(200);

      // Revert back to original email to be able to sign in with seeded user credentials for other tests
      result = await factory.app
        .patch(`/profile/update`)
        .send({ email: profileTestsConstants.ORIGINAL_EMAIL })
        .set({ Authorization: `Bearer ${token}` });

      expect(result.status).toBe(201);

      // Test that user can login with original email
      result = await factory.app.post('/auth/login').send({
        email: profileTestsConstants.ORIGINAL_EMAIL,
        password: profileTestsConstants.ORIGINAL_PASSWORD,
      });

      expect(result.status).toBe(200);

      // Test that user cannot login with new email
      result = await factory.app.post('/auth/login').send({
        email: profileTestsConstants.NEW_EMAIL,
        password: profileTestsConstants.ORIGINAL_PASSWORD,
      });

      expect(result.status).toBe(401);

      done();
    });

    test('patches permitted fields: password', async (done) => {
      const newPassword = 'patchedPassword';
      const originalPassword = 'admin_password';

      let result = await factory.app
        .patch(`/profile/update`)
        .send({ password: newPassword })
        .set({ Authorization: `Bearer ${token}` });

      expect(result.status).toBe(201);

      // Revert back to original password to be able to sign in with seeded user credentials for other tests
      result = await factory.app
        .patch(`/profile/update`)
        .send({ password: originalPassword })
        .set({ Authorization: `Bearer ${token}` });

      expect(result.status).toBe(201);

      done();
    });

    test('user can login with patched password, cannot login with original password', async (done) => {
      let result = await factory.app
        .patch(`/profile/update`)
        .send({ password: profileTestsConstants.NEW_PASSWORD })
        .set({ Authorization: `Bearer ${token}` });

      expect(result.status).toBe(201);

      // Test that user cannot login with original password
      result = await factory.app.post('/auth/login').send({
        email: profileTestsConstants.ORIGINAL_EMAIL,
        password: profileTestsConstants.ORIGINAL_PASSWORD,
      });

      expect(result.status).toBe(401);

      // Test that user can sign in with new password
      result = await factory.app.post('/auth/login').send({
        email: profileTestsConstants.ORIGINAL_EMAIL,
        password: profileTestsConstants.NEW_PASSWORD,
      });

      expect(result.status).toBe(200);

      // Revert back to original password to be able to sign in with seeded user credentials for other tests
      result = await factory.app
        .patch(`/profile/update`)
        .send({ password: profileTestsConstants.ORIGINAL_PASSWORD })
        .set({ Authorization: `Bearer ${token}` });

      expect(result.status).toBe(201);

      // Test that user can login with original password
      result = await factory.app.post('/auth/login').send({
        email: profileTestsConstants.ORIGINAL_EMAIL,
        password: profileTestsConstants.ORIGINAL_PASSWORD,
      });

      expect(result.status).toBe(200);

      // Test that user cannot login with new password
      result = await factory.app.post('/auth/login').send({
        email: profileTestsConstants.ORIGINAL_EMAIL,
        password: profileTestsConstants.NEW_PASSWORD,
      });

      expect(result.status).toBe(401);

      done();
    });

    test('patches permitted fields: role', async (done) => {
      let result = await factory.app
        .patch('/profile/update')
        .send({ role: profileTestsConstants.NEW_ROLE })
        .set({ Authorization: `Bearer ${token}` });

      expect(result.status).toBe(201);
      expect(result.body.role).toBe(profileTestsConstants.NEW_ROLE);

      let patchedUser: User = await getConnection(process.env.CONNECTION_TYPE)
        .getRepository(User)
        .findOneOrFail({ email: profileTestsConstants.ORIGINAL_EMAIL });

      expect(patchedUser.role).toBe(profileTestsConstants.NEW_ROLE);

      // Revert back to original password to be able to sign in with seeded user credentials for other tests
      result = await factory.app
        .patch(`/profile/update`)
        .send({ role: profileTestsConstants.ORIGINAL_ROLE })
        .set({ Authorization: `Bearer ${token}` });

      expect(result.status).toBe(201);
      expect(result.body.role).toBe(profileTestsConstants.ORIGINAL_ROLE);

      patchedUser = await getConnection(process.env.CONNECTION_TYPE)
        .getRepository(User)
        .findOneOrFail({ email: profileTestsConstants.ORIGINAL_EMAIL });

      expect(patchedUser.role).toBe('ADMIN');

      done();
    });

    test('user cannot access ADMIN-only endpoints when role is patched to USER', async (done) => {
      let result = await factory.app
        .patch('/profile/update')
        .send({ role: profileTestsConstants.NEW_ROLE })
        .set({ Authorization: `Bearer ${token}` });

      expect(result.status).toBe(201);
      expect(result.body.role).toBe(profileTestsConstants.NEW_ROLE);

      // Arbitrarily chosen ADMIN-only endpoint
      result = await factory.app.get('/users/').set({ Authorization: `Bearer ${token}` });

      expect(result.status).toBe(401);
      expect(result.text).toBe('User does not have permission to access this endpoint');

      // Revert back to original password to be able to sign in with seeded user credentials for other tests
      result = await factory.app
        .patch(`/profile/update`)
        .send({ role: profileTestsConstants.ORIGINAL_ROLE })
        .set({ Authorization: `Bearer ${token}` });

      expect(result.status).toBe(201);
      expect(result.body.role).toBe(profileTestsConstants.ORIGINAL_ROLE);

      done();
    });

    test('Does not patch prohibited fields: id', async (done) => {
      // const seededUser: User = await factory.seedSingleUser();

      // const newId = (await getOneMaxId()) + 1;

      // const postPatchResult = await factory.app
      //   .patch(`/users/${seededUser.id}`)
      //   .send({ id: newId })
      //   .set({ Authorization: `Bearer ${token}` });

      // expect(postPatchResult.status).toBe(400);
      // expect(postPatchResult.text).toEqual('Field cannot be updated');

      // const patchedUser: User = await getConnection(process.env.CONNECTION_TYPE)
      //   .getRepository(User)
      //   .findOneOrFail({ email: seededUser.email });

      // expect(patchedUser.id).not.toEqual(newId);
      // expect(patchedUser.id).toEqual(seededUser.id);

      //generate Id that is not currently used, to ensure is not due to Id already existing in db
      const newId = (await getOneMaxId()) + 1;

      let result = await factory.app
        .patch('/profile/update')
        .send({ id: newId })
        .set({ Authorization: `Bearer ${token}` });

      done();
    });

    // test('Does not patch prohibited fields: nonExistentField', async (done) => {
    //   const seededUser: User = await factory.seedSingleUser();

    //   const newInvalidField = 'invalid update';

    //   const result = await factory.app
    //     .patch(`/users/${seededUser.id}`)
    //     .send({ newInvalidField })
    //     .set({ Authorization: `Bearer ${token}` });

    //   expect(result.status).toBe(400);
    //   expect(result.text).toEqual('Field cannot be updated');

    //   done();
    // });

    // test('Return 409 if requested email already exists in the db', async (done) => {
    //   const seededUser: User = await factory.seedSingleUser();

    //   const users: User[] = await getConnection(process.env.CONNECTION_TYPE).getRepository(User).find({ role: 'USER' });
    //   // get random user from db
    //   const retrievedUser: User = users[Math.floor(Math.random() * users.length)];

    //   const result = await factory.app
    //     .patch(`/users/${seededUser.id}`)
    //     .send({ email: retrievedUser.email })
    //     .set({ Authorization: `Bearer ${token}` });

    //   expect(result.status).toBe(409);
    //   expect(result.text).toBe('email already in use');

    //   done();
    // });
  });
  // Make sure this does not get blocked by email uniqueness validation
  describe('PATCH /profile/change-password', () => {});
  describe('DELETE /profile/delete', () => {});
});
