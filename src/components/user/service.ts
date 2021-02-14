import { Repository, getRepository } from 'typeorm';
import { User } from './model';

import faker from 'faker';

export class UserService {
  readonly repo: Repository<User> = getRepository(User);

  public async create(): Promise<User> {
    try {
      let user = new User();
      user.email = faker.internet.email();
      user.password = faker.internet.password();
      user.firstName = faker.name.firstName();
      user.lastName = faker.name.lastName();
      user.age = Math.floor(Math.random() * (70 - 18 + 1) + 18);

      return await this.repo.save(user);
    } catch (err) {
      return err;
    }
  }

  //TODO: Input query parameters
  public async readAll(): Promise<User[]> {
    try {
      console.log('Loading users from the database...');
      return await this.repo.find({});
    } catch (err) {
      return err;
    }
  }

  public async readUserById(id: number): Promise<User[]> {
    try {
      console.log('Loading users from the database...');
      return await this.repo.find({ where: { id: id } });
    } catch (err) {
      return err;
    }
  }

  public async deleteUserById(id: number): Promise<User[]> {
    try {
      console.log('Deleting user from the database...');
      const user = await this.repo.find({ where: { id: id } });
      return await this.repo.remove(user);
    } catch (err) {
      return err;
    }
  }
}
