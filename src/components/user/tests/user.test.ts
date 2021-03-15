import { TestFactory } from '../../../utils/testing/factory';
import { User } from '../model';

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

  describe('GET /users/:id', () => {});
  describe('GET /users/search', () => {});
  describe('POST /users/', () => {});
  describe('PATCH /users/:id', () => {});
  describe('GET /users/:id', () => {});
  describe('DELETE /users/:id', () => {});
});
