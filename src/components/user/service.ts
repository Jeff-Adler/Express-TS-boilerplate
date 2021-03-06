import { User } from './model';
import { getManager, Repository, FindManyOptions, OrderByCondition, FindConditions, getConnection } from 'typeorm';
import { bind } from 'decko';
import { Request } from 'express';
import { Role, rolesArr } from './utils/Roles';

export class UserService {
  readonly repo: Repository<User> = getConnection(process.env.CONNECTION_TYPE).getRepository(User);

  /**
   * Read all users from db
   *
   * @param options Find options
   * @returns Returns an array of users
   */
  @bind
  public readAll(options: FindManyOptions<User> = { select: ['id', 'email', 'role'] }): Promise<User[]> {
    try {
      return this.repo.find(options);
    } catch (e) {
      throw new Error(e);
    }
  }

  /**
   * Handle all query parameters for GET users
   *
   * @returns Returns an object of TypeORM Find Options
   */
  public handleQueryParams(req: Request): FindManyOptions<User> {
    let where: FindConditions<User> = {};
    let order: OrderByCondition = {};
    let skip: number;
    let take: number;

    const isValidOrderByCondition = (parts: { [columnName: string]: string }): boolean => {
      return <OrderByCondition>parts !== undefined;
    };

    const role = <Role>(<string>req.query.role)?.toUpperCase();
    // Runtime validation of role parameter
    if (rolesArr.includes(role)) where = { ...where, role: role };

    let columnName: string = '';
    let ordering: string = '';
    const parts: string[] = (<string>req.query.orderBy)?.split(':');
    if (parts && parts.length >= 2) [columnName, ordering] = parts;
    if (columnName && ordering && isValidOrderByCondition({ [columnName]: ordering.toUpperCase() })) {
      order = <OrderByCondition>{ [columnName]: ordering.toUpperCase() };
    }

    skip = parseInt(<string>req.query.skip) || 0;
    take = parseInt(<string>req.query.take) || 0;

    let options: FindManyOptions<User> = { select: ['id', 'email', 'role'] };

    if (Object.keys(where).length) options = { ...options, where };
    if (Object.keys(order).length) options = { ...options, order };
    if (skip) options = { ...options, skip };
    if (take) options = { ...options, take };

    return options;
  }
}
