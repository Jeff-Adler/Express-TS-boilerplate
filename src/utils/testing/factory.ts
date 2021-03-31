import 'reflect-metadata';
import express from 'express';
import supertest from 'supertest';
import { createConnection, Connection, Repository } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import faker from 'faker';

import { App } from '../../app';
import { User } from '../../components/user/model';
import { Role } from '../../components/user/utils/Roles';

/**
 * TestFactory
 * - Loaded in each unit test
 * - Starts server and DB connection
 */

export class TestFactory {
  private _connection!: Connection;
  private _app!: express.Application;
  private _userRepo!: Repository<User>;

  // DB connection options
  private options: PostgresConnectionOptions = {
    name: 'testing',
    type: 'postgres',
    host: '127.0.0.1',
    port: 5432,
    username: 'jeff',
    password: '',
    database: 'mock_db',
    dropSchema: true,
    synchronize: true,
    logging: false,
    migrationsRun: true,
    entities: ['src/components/**/model.ts'],
  };

  /**
   * Wrap Express.application object inside supertest
   */
  public get app(): supertest.SuperTest<supertest.Test> {
    return supertest(this._app);
  }

  public get connection(): Connection {
    return this._connection;
  }

  /**
   * Connect to DB and initialize app
   */
  public async init(): Promise<void> {
    this._connection = await createConnection(this.options);

    this._userRepo = this._connection.getRepository(User);
    await this.seedAdminUser();

    this._app = new App().app;
  }

  /**
   * Close DB connection
   */
  public async close(): Promise<void> {
    await this.wipeUsers();
    this._connection.close();
  }

  /**
   * Login admin user for authentication across endpoints
   */
  public async loginAdminUser() {
    return await this.app.post('/auth/login').send({
      email: 'admin@admin.com',
      password: 'admin_password',
    });
  }

  /**
   * Create admin user for authentication across endpoints
   */
  private async seedAdminUser(): Promise<void> {
    const adminUserCreds = {
      email: 'admin@admin.com',
      password: 'admin_password',
      role: 'ADMIN',
    };

    let adminUser: User = new User();
    const { email, password, role } = adminUserCreds;
    adminUser.email = email;
    adminUser.password = password;
    adminUser.role = <Role>role;
    const user = await this._userRepo.save(adminUser);
  }

  /**
   * Seed users into database for testing
   */
  public async seedUsers(): Promise<void> {
    for (let i = 0; i < 10; i++) {
      const userCreds = {
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: 'USER',
      };

      let user: User = new User();
      const { email, password, role } = userCreds;
      user.email = email;
      user.password = password;
      user.role = <Role>role;
      await this._userRepo.save(user);
    }
  }

  /**
   * Seed and return single user. For use by individual tests
   */
  public async seedSingleUser(): Promise<User> {
    const email = faker.internet.email();
    const password = 'testUserPassword';
    const role = 'USER';

    let user: User = new User();

    user.email = email;
    user.password = password;
    user.role = <Role>role;

    try {
      await this._userRepo.save(user);
      return this._userRepo.findOneOrFail({ email });
    } catch {
      throw new Error('Could not save user');
    }
  }

  /**
   * Wipe database
   */
  private async wipeUsers(): Promise<void> {
    await this._userRepo.createQueryBuilder().delete().execute();
  }
}
