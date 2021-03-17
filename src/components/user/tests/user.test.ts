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

      console.log(result.body);
      expect(result.status).toBe(400);
      done();
    });
  });
  describe('PATCH /users/:id', () => {
    test.todo('Patches permitted fields');

    test.todo('Does not patch prohibited fields');
  });
  describe('DELETE /users/:id', () => {
    test.todo('Deletes user if valid id is sent');

    test.todo('Does not delete user if invalid id is sent');
  });
});
