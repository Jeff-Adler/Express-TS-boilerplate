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

    test('does not patch prohibited field: password', async (done) => {
      let result = await factory.app
        .patch(`/profile/update`)
        .send({ password: profileTestsConstants.NEW_PASSWORD })
        .set({ Authorization: `Bearer ${token}` });

      expect(result.status).toBe(400);
      expect(result.text).toEqual('Field cannot be updated');

      done();
    });

    test('does not patch prohibited fields: role', async (done) => {
      let result = await factory.app
        .patch('/profile/update')
        .send({ role: profileTestsConstants.NEW_ROLE })
        .set({ Authorization: `Bearer ${token}` });

      expect(result.status).toBe(400);
      expect(result.text).toEqual('Field cannot be updated');

      let patchedUser: User = await getConnection(process.env.CONNECTION_TYPE)
        .getRepository(User)
        .findOneOrFail({ email: profileTestsConstants.ORIGINAL_EMAIL });

      expect(patchedUser.role).toBe(profileTestsConstants.ORIGINAL_ROLE);

      done();
    });

    test('Does not patch prohibited fields: id', async (done) => {
      const prePatchedUser: User = await getConnection(process.env.CONNECTION_TYPE)
        .getRepository(User)
        .findOneOrFail({ email: profileTestsConstants.ORIGINAL_EMAIL });

      //generate Id that is not currently used, to ensure is not due to Id already existing in db
      const newId = (await getOneMaxId()) + 1;

      let result = await factory.app
        .patch('/profile/update')
        .send({ id: newId })
        .set({ Authorization: `Bearer ${token}` });

      expect(result.status).toBe(400);
      expect(result.text).toEqual('Field cannot be updated');

      const patchedUser: User = await getConnection(process.env.CONNECTION_TYPE)
        .getRepository(User)
        .findOneOrFail({ email: profileTestsConstants.ORIGINAL_EMAIL });

      expect(patchedUser.id).not.toEqual(newId);
      expect(patchedUser.id).toEqual(prePatchedUser.id);

      done();
    });

    test('Does not patch prohibited fields: nonExistentField', async (done) => {
      const newInvalidField = 'invalid update';

      const result = await factory.app
        .patch('/profile/update')
        .send({ newInvalidField })
        .set({ Authorization: `Bearer ${token}` });

      expect(result.status).toBe(400);
      expect(result.text).toEqual('Field cannot be updated');

      done();
    });

    test('Return 409 if requested email already exists in the db', async (done) => {
      const seededUser: User = await factory.seedSingleUser();

      const result = await factory.app
        .patch('/profile/update')
        .send({ email: seededUser.email })
        .set({ Authorization: `Bearer ${token}` });

      expect(result.status).toBe(409);
      expect(result.text).toBe('email already in use');

      done();
    });
  });

  // Make sure this does not get blocked by email uniqueness validation
  describe('PATCH /profile/change-password', () => {
    test('patches permitted fields: password', async (done) => {
      let result = await factory.app
        .patch(`/profile/change-password`)
        .send({
          oldPassword: profileTestsConstants.ORIGINAL_PASSWORD,
          newPassword: profileTestsConstants.NEW_PASSWORD,
        })
        .set({ Authorization: `Bearer ${token}` });

      expect(result.status).toBe(200);

      // Revert back to original password to be able to sign in with seeded user credentials for other tests
      result = await factory.app
        .patch(`/profile/change-password`)
        .send({
          oldPassword: profileTestsConstants.NEW_PASSWORD,
          newPassword: profileTestsConstants.ORIGINAL_PASSWORD,
        })
        .set({ Authorization: `Bearer ${token}` });

      expect(result.status).toBe(200);

      done();
    });

    test('user can login with patched password, cannot login with original password', async (done) => {
      let result = await factory.app
        .patch(`/profile/change-password`)
        .send({
          oldPassword: profileTestsConstants.ORIGINAL_PASSWORD,
          newPassword: profileTestsConstants.NEW_PASSWORD,
        })
        .set({ Authorization: `Bearer ${token}` });

      expect(result.status).toBe(200);
      expect(result.text).toBe('Password changed');

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
        .patch(`/profile/change-password`)
        .send({
          oldPassword: profileTestsConstants.NEW_PASSWORD,
          newPassword: profileTestsConstants.ORIGINAL_PASSWORD,
        })
        .set({ Authorization: `Bearer ${token}` });

      expect(result.status).toBe(200);

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
  });
  describe('DELETE /profile/delete', () => {
    test('deletes profile', async (done) => {
      const seededUser: User = await factory.seedSingleUser();

      // Log in as seededUser
      let result = await factory.app.post('/auth/login').send({
        email: seededUser.email,
        password: 'testUserPassword',
      });

      expect(result.status).toBe(200);

      token = result.body.token;

      // Delete seededUser
      result = await factory.app.delete('/profile/delete').set({ Authorization: `Bearer ${token}` });

      expect(result.status).toBe(200);
      expect(result.text).toBe('Account deleted');

      // Verify seededUser is absent from db
      const user = await getConnection(process.env.CONNECTION_TYPE)
        .getRepository(User)
        .findOne({ email: seededUser.email });

      expect(user).toBe(undefined);

      done();
    });

    test('user can no longer sign if deleted', async (done) => {
      const seededUser: User = await factory.seedSingleUser();

      // Log in as seededUser
      let result = await factory.app.post('/auth/login').send({
        email: seededUser.email,
        password: 'testUserPassword',
      });

      expect(result.status).toBe(200);

      token = result.body.token;

      // Delete seededUser
      result = await factory.app.delete('/profile/delete').set({ Authorization: `Bearer ${token}` });

      expect(result.status).toBe(200);
      expect(result.text).toBe('Account deleted');

      // Verify seededUser cannot sign in
      result = await factory.app.post('/auth/login').send({
        email: seededUser.email,
        password: 'testUserPassword',
      });

      expect(result.status).toBe(401);

      done();
    });
  });
});
