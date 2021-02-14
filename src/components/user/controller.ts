// import { NextFunction, Request, Response } from 'express';

import { bind } from 'decko';
import { User } from './model';
import { UserService } from './service';

export class UserController {
  private readonly userService: UserService;
  constructor() {
    this.userService = new UserService();
  }

  @bind
  public async readUsers(): Promise<void> {
    try {
      const users: User[] = await this.userService.readAll();
      console.log('Loaded users: ', users);
    } catch (err) {
      console.log(err);
    }
  }

  @bind
  public async readUserById(): Promise<void> {
    try {
      const users: User[] = await this.userService.readUserById(1);
      console.log('Loaded users: ', users);
    } catch (err) {
      console.log(err);
    }
  }

  @bind
  public async deleteUserById(): Promise<void> {
    try {
      const users: User[] = await this.userService.deleteUserById(6);
      console.log('Deleted users: ', users);
    } catch (err) {
      console.log(err);
    }
  }
}
