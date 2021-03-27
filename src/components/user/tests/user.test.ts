import { getConnection } from 'typeorm';

import { TestFactory } from '../../../utils/testing/factory';
import { User } from '../model';
import { getOneMaxId } from './userFactory';

describe('Test User component', () => {
  let factory: TestFactory = new TestFactory();

  let token: string;

  beforeAll(async (done) => {
    await factory.init();

    await factory.seedUsers();

    const result = await factory.loginAdminUser();

    // Set JWT
    token = result.body.token;

    done();
  });

  afterAll(async () => {
    await factory.close();
  });

  describe('GET /users/', () => {
    test('returns 200 status for valid request', async (done) => {
      const result = await factory.app.get('/users/').set({ Authorization: `Bearer ${token}` });

      expect(result.status).toBe(200);
      done();
    });

    test('returns an array of user objects user objects', async (done) => {
      const result = await factory.app.get('/users/').set({ Authorization: `Bearer ${token}` });

      const users: User[] = result.body;

      const usersFiltered = users.filter((user) => {
        return <User>user !== undefined;
      });

      expect(users.length).toBe(usersFiltered.length);
      done();
    });

    test('Every user in response contains only id, email, and role fields', async (done) => {
      const result = await factory.app.get('/users/').set({ Authorization: `Bearer ${token}` });
      const userResFields = ['id', 'email', 'role'];
      const users: User[] = result.body;

      const usersFiltered = users.filter((user) => {
        return Object.keys(user).sort().join(',') === userResFields.sort().join(',');
      });

      expect(users.length).toBe(usersFiltered.length);
      done();
    });

    test('returns 400 error if invalid request is sent', async (done) => {
      const result = await factory.app.get('/users/').set({});

      expect(result.status).toBe(401);
      done();
    });

    describe('GET /users/ query params', () => {
      test('?role=USER returns only users with USER role', async (done) => {
        const result = await factory.app.get('/users?role=USER').set({ Authorization: `Bearer ${token}` });

        const users: User[] = result.body;

        expect(users.every((user) => user.role === 'USER') && !!users.length).toEqual(true);
        done();
      });

      test('?orderBy=id:DESC returns users in reverse id order', async (done) => {
        const result = await factory.app.get('/users?orderBy=createdAt:DESC').set({ Authorization: `Bearer ${token}` });

        const users: User[] = result.body;
        const sortedUsers: User[] = [...users].sort((user1, user2) => {
          return user2.id - user1.id;
        });

        expect(users.join(',') === sortedUsers.join(',')).toBe(true);
        done();
      });

      test('?take=3 returns 3 users', async (done) => {
        const result = await factory.app.get('/users?take=3').set({ Authorization: `Bearer ${token}` });

        const users: User[] = result.body;

        expect(users.length).toEqual(3);
        done();
      });

      test('?skip=3 skips 3 users', async (done) => {
        const result = await factory.app.get('/users?skip=3&take=3').set({ Authorization: `Bearer ${token}` });
        const result2 = await factory.app.get('/users?take=6').set({ Authorization: `Bearer ${token}` });

        const take3skip3Users: User[] = result.body;
        const take6Users: User[] = result2.body;

        const remainingUsers = take6Users.filter((userA) => {
          return take3skip3Users.find((userB) => userA.id === userB.id);
        });

        expect(remainingUsers.length).toEqual(3);
        done();
      });

      test('invalid query params just returns all users', async (done) => {
        const result = await factory.app.get('/users?illicitRequest=illicit').set({ Authorization: `Bearer ${token}` });
        const result2 = await factory.app.get('/users/').set({ Authorization: `Bearer ${token}` });

        const users: User[] = result.body;
        const users2: User[] = result2.body;

        expect(users.join(',') === users2.join(',')).toBe(true);
        done();
      });
    });
  });

  describe('GET /users/:id', () => {
    test('GET /users/<id> return a single user with id, email, and role fields from user of id <id>', async (done) => {
      const reqId = 1;
      const result = await factory.app.get(`/users/${reqId}`).set({ Authorization: `Bearer ${token}` });

      const { id, email, role } = result.body;
      const user = await getConnection(process.env.CONNECTION_TYPE).getRepository(User).findOneOrFail(reqId);

      expect(id).toEqual(user.id);
      expect(email).toEqual(user.email);
      expect(role).toEqual(user.role);
      done();
    });

    test('GET /users/<non-numeric string> does not reach GET /users/:id endpoint', async (done) => {
      const reqId = 'nonNumericString';
      const result = await factory.app.get(`/users/${reqId}`).set({ Authorization: `Bearer ${token}` });

      expect(result.status).toBe(400);
      done();
    });

    test('GET /users/<OutofBoundsId> returns a 400 status', async (done) => {
      const reqId = 3000;
      const result = await factory.app.get(`/users/${reqId}`).set({ Authorization: `Bearer ${token}` });

      expect(result.status).toBe(404);
      done();
    });
  });

  describe('GET /users/search', () => {
    test('GET /users/search returns 200 response and user if valid email is sent', async (done) => {
      const searchEmail = 'admin@admin.com';
      const result = await factory.app
        .get(`/users/search?email=${searchEmail}`)
        .set({ Authorization: `Bearer ${token}` });

      const { id, email, role } = result.body;
      const user = await getConnection(process.env.CONNECTION_TYPE)
        .getRepository(User)
        .findOneOrFail({ email: searchEmail });

      expect(id).toEqual(user.id);
      expect(email).toEqual(user.email);
      expect(role).toEqual(user.role);
      done();
    });

    test('GET /users/search returns 400 response and no user if invalid email is sent', async (done) => {
      const searchEmail = 'invalid@invalid.com';
      const result = await factory.app
        .get(`/users/search?email=${searchEmail}`)
        .set({ Authorization: `Bearer ${token}` });

      expect(result.status).toBe(400);
      done();
    });
  });

  describe('POST /users/', () => {
    test('Sends 200 response and creates new user for valid user credentials', async (done) => {
      const email = 'test@test.com';
      const password = 'test_password';
      const role = 'USER';
      const result = await factory.app
        .post(`/users/`)
        .send({ email, password, role })
        .set({ Authorization: `Bearer ${token}` });

      expect(result.body.email).toEqual(email);
      done();
    });

    test('Sending valid response adds a user to the database', async (done) => {
      const usersBeforeReq: User[] = await getConnection(process.env.CONNECTION_TYPE).getRepository(User).find({});

      const email = 'test2@test.com';
      const password = 'test_password';
      const role = 'USER';
      const result = await factory.app
        .post(`/users/`)
        .send({ email, password, role })
        .set({ Authorization: `Bearer ${token}` });

      const usersAfterReq: User[] = await getConnection(process.env.CONNECTION_TYPE).getRepository(User).find({});

      expect(usersAfterReq.length).toEqual(usersBeforeReq.length + 1);
      done();
    });

    test('Sends 400 response and does not create new user for invalid user credentials: email', async (done) => {
      const email = 'invalidEmail';
      const password = 'test_password';
      const role = 'USER';
      const result = await factory.app
        .post(`/users/`)
        .send({ email, password, role })
        .set({ Authorization: `Bearer ${token}` });

      expect(result.status).toBe(400);
      done();
    });

    test('Sends 400 response and does not create new user for invalid user credentials: password', async (done) => {
      const email = 'test@test.com';
      const password = 'test';
      const role = 'USER';
      const result = await factory.app
        .post(`/users/`)
        .send({ email, password, role })
        .set({ Authorization: `Bearer ${token}` });

      expect(result.status).toBe(400);
      done();
    });

    test('Sends 400 response and does not create new user for invalid user credentials: role', async (done) => {
      const email = 'test3@test.com';
      const password = 'test_password';
      const role = 'InvalidRole';
      const result = await factory.app
        .post(`/users/`)
        .send({ email, password, role })
        .set({ Authorization: `Bearer ${token}` });

      expect(result.status).toBe(400);
      done();
    });
  });

  describe('PATCH /users/:id', () => {
    test('Patches permitted fields: email', async (done) => {
      const seededUser: User = await factory.seedSingleUser();

      const newEmail = 'patchedEmail@test.com';

      const result = await factory.app
        .patch(`/users/${seededUser.id}`)
        .send({ email: newEmail })
        .set({ Authorization: `Bearer ${token}` });

      expect(result.status).toBe(201);
      expect(result.body.email).toEqual(newEmail);

      // TODO: These conditions and their equivalent in other tests should be indepedent unit tests:
      const patchedUser: User = await getConnection(process.env.CONNECTION_TYPE)
        .getRepository(User)
        .findOneOrFail({ email: newEmail });
      expect(patchedUser.id).toEqual(seededUser.id);
      expect(patchedUser.email).not.toBe(seededUser.email);
      expect(patchedUser.email).toBe(newEmail);

      done();
    });

    test('Patches permitted fields: password', async (done) => {
      const seededUser: User = await factory.seedSingleUser();

      const newPassword = 'patchedPassword';

      const result = await factory.app
        .patch(`/users/${seededUser.id}`)
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
      const retrievedUser: User = users[Math.floor(Math.random() * users.length) + 1];

      const result = await factory.app
        .patch(`/users/${seededUser.id}`)
        .send({ email: retrievedUser.email })
        .set({ Authorization: `Bearer ${token}` });

      expect(result.status).toBe(409);
      expect(result.text).toBe('email already in use');

      done();
    });
  });
  describe('DELETE /users/:id', () => {
    test('Deletes user if valid id is sent', async (done) => {
      const seededUser: User = await factory.seedSingleUser();

      const result = await factory.app.delete(`/users/${seededUser.id}`).set({ Authorization: `Bearer ${token}` });

      expect(result.status).toBe(201);
      expect(result.text).toEqual(`Removed user ${seededUser.email}`);

      const deletedUser: User | undefined = await getConnection(process.env.CONNECTION_TYPE)
        .getRepository(User)
        .findOne({ email: seededUser.email });
      expect(deletedUser).toBe(undefined);

      done();
    });

    test('Does not delete user if invalid id is sent', async (done) => {
      // Retrieve highest id in db and add one to generate an id that does not exist in the db
      const invalidId = (await getOneMaxId()) + 1;

      const result = await factory.app.delete(`/users/${invalidId}`).set({ Authorization: `Bearer ${token}` });

      expect(result.status).toBe(404);
      expect(result.text).toEqual(`User not found`);
      done();
    });
  });
});
