import { User } from './model';
import { getManager, Repository, FindManyOptions } from 'typeorm';
import { bind } from 'decko';

export class UserService {
  readonly repo: Repository<User> = getManager().getRepository(User);

  /**
   * Read all users from db
   *
   * @param options Find options
   * @returns Returns an array of users
   */
  @bind
  public readAll(options: FindManyOptions<User> = {}): Promise<User[]> {
    try {
      return this.repo.find({ ...options, select: ['id', 'email', 'role'] });
    } catch (e) {
      throw new Error(e);
    }
  }
}
