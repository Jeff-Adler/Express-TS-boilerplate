import { TestFactory } from '../../../utils/testing/factory';
import { User } from '../model';
import { getConnection } from 'typeorm';

describe('Test User component', () => {
  let factory: TestFactory = new TestFactory();

  let token: string;

  beforeAll(async (done) => {
    await factory.init();

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
      const email = 'testprePatchUser@test.com';
      const password = 'testPatchUser';
      const role = 'USER';
      const prePatchResult = await factory.app
        .post(`/users/`)
        .send({ email, password, role })
        .set({ Authorization: `Bearer ${token}` });

      expect(prePatchResult.status).toBe(201);
      expect(prePatchResult.body.email).toBe('testprePatchUser@test.com');

      const patchedEmail = 'testpostPatchUser@test.com';

      const user: User = await getConnection(process.env.CONNECTION_TYPE).getRepository(User).findOneOrFail({ email });
      const postPatchResult = await factory.app
        .patch(`/users/${user.id}`)
        .send({ email: patchedEmail })
        .set({ Authorization: `Bearer ${token}` });

      const postPatchUser: User = await getConnection(process.env.CONNECTION_TYPE)
        .getRepository(User)
        .findOneOrFail({ email: patchedEmail });

      expect(postPatchResult.status).toBe(201);
      expect(postPatchResult.body.email).toBe('testpostPatchUser@test.com');
      expect(postPatchUser.id).toEqual(user.id);
      expect(postPatchUser.email).not.toBe(email);
      expect(postPatchUser.email).toBe(patchedEmail);
      done();
    });

    test('Patches permitted fields: password', async (done) => {
      const email = 'testprePatchUser2@test.com';
      const password = 'testprePatchUser';
      const role = 'USER';
      const prePatchResult = await factory.app
        .post(`/users/`)
        .send({ email, password, role })
        .set({ Authorization: `Bearer ${token}` });

      expect(prePatchResult.status).toBe(201);

      const patchedPassword = 'testpostPatchUser';

      const user: User = await getConnection(process.env.CONNECTION_TYPE).getRepository(User).findOneOrFail({ email });
      const prePatchHashedPassword = user.password;
      // Expect that original password is hashed
      expect(prePatchHashedPassword).not.toBe(password);

      const postPatchResult = await factory.app
        .patch(`/users/${user.id}`)
        .send({ password: patchedPassword })
        .set({ Authorization: `Bearer ${token}` });

      expect(postPatchResult.status).toBe(201);

      const postPatchUser: User = await getConnection(process.env.CONNECTION_TYPE)
        .getRepository(User)
        .findOneOrFail({ email });

      const postPatchHashedPassword = postPatchUser.password;
      // Expect that updated password is hashed
      expect(postPatchHashedPassword).not.toBe(patchedPassword);
      // Expect that updated password is not equal to original password
      expect(prePatchHashedPassword).not.toEqual(postPatchHashedPassword);

      done();
    });

    test('Patches permitted fields: role', async (done) => {
      // const email = 'testprePatchUser@test.com';
      // const password = 'testPatchUser';
      // const role = 'USER';
      // const prePatchResult = await factory.app
      //   .post(`/users/`)
      //   .send({ email, password, role })
      //   .set({ Authorization: `Bearer ${token}` });

      // expect(prePatchResult.status).toBe(201);
      // expect(prePatchResult.body.email).toBe('testprePatchUser@test.com');

      // const patchedEmail = 'testpostPatchUser@test.com';

      // const user: User = await getConnection(process.env.CONNECTION_TYPE).getRepository(User).findOneOrFail({ email });
      // const postPatchResult = await factory.app
      //   .patch(`/users/${user.id}`)
      //   .send({ email: patchedEmail })
      //   .set({ Authorization: `Bearer ${token}` });

      // expect(postPatchResult.status).toBe(201);
      // expect(postPatchResult.body.email).toBe('testpostPatchUser@test.com');
      done();
    });

    test.todo('Does not patch prohibited fields');

    test.todo('Return 409 if requested new email already exists in the db');

    test.todo('Possibly send error if same value is given for requested patch');
  });
  describe('DELETE /users/:id', () => {
    test.todo('Deletes user if valid id is sent');

    test.todo('Does not delete user if invalid id is sent');
  });
});
