import { Request, Response } from 'express';
import { getRepository, Repository } from 'typeorm';
import { validate } from 'class-validator';

import { User } from './model';

//TODO: Consider moving logic to user/services
export class UserController {
  readonly repo: Repository<User> = getRepository(User);

  public async listAll(req: Request, res: Response): Promise<void> {
    //Get users from database
    const users = await this.repo.find({
      select: ['id', 'email', 'role'], //We dont want to send the passwords on response
    });

    //Send the users object
    res.send(users);
  }

  public async getOneById(req: Request, res: Response) {
    //Get the ID from the url
    const id: number = parseInt(req.params.id);

    //Get the user from database
    try {
      const user = await this.repo.findOneOrFail(id, {
        select: ['id', 'email', 'role'], //We dont want to send the password on response
      });
    } catch (error) {
      res.status(404).send('User not found');
    }
  }

  public async newUser(req: Request, res: Response) {
    //Get parameters from the body
    let { email, password, role } = req.body;
    let user = new User();
    user.email = email;
    user.password = password;
    user.role = role;

    //Validade if the parameters are ok
    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    //Try to save. If fails, the email is already in use
    try {
      await this.repo.save(user);
    } catch (e) {
      res.status(409).send('email already in use');
      return;
    }

    //If all ok, send 201 response
    res.status(201).send('User created');
  }

  public async editUser(req: Request, res: Response) {
    //Get the ID from the url
    const id = req.params.id;

    //Get values from the body
    const { email, role } = req.body;

    //Try to find user on database
    let user;
    try {
      user = await this.repo.findOneOrFail(id);
    } catch (error) {
      //If not found, send a 404 response
      res.status(404).send('User not found');
      return;
    }

    //Validate the new values on model
    user.email = email;
    user.role = role;
    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    //Try to safe, if fails, that means email already in use
    try {
      await this.repo.save(user);
    } catch (e) {
      res.status(409).send('email already in use');
      return;
    }
    //After all send a 204 (no content, but accepted) response
    res.status(204).send();
  }

  public async deleteUser(req: Request, res: Response) {
    //Get the ID from the url
    const id = req.params.id;

    let user: User;
    try {
      user = await this.repo.findOneOrFail(id);
    } catch (error) {
      res.status(404).send('User not found');
      return;
    }
    this.repo.delete(id);

    //After all send a 204 (no content, but accepted) response
    res.status(204).send();
  }
}

// import { NextFunction, Request, Response } from 'express';

// import { bind } from 'decko';
// import { User } from './model';
// import { UserService } from './service';

// export class UserController {
//   private readonly userService: UserService;
//   constructor() {
//     this.userService = new UserService();
//   }

//   @bind
//   public async createUser(): Promise<void> {
//     try {
//       const user: User = await this.userService.create();
//       console.log('Added user: ', user);
//     } catch (err) {
//       console.log(err);
//     }
//   }

//   @bind
//   public async readUsers(): Promise<void> {
//     try {
//       const users: User[] = await this.userService.readAll();
//       console.log('Loaded users: ', users);
//     } catch (err) {
//       console.log(err);
//     }
//   }

//   @bind
//   public async readUserById(): Promise<void> {
//     try {
//       const users: User[] = await this.userService.readUserById(1);
//       console.log('Loaded users: ', users);
//     } catch (err) {
//       console.log(err);
//     }
//   }

//   @bind
//   public async deleteUserById(): Promise<void> {
//     try {
//       const users: User[] = await this.userService.deleteUserById(6);
//       console.log('Deleted users: ', users);
//     } catch (err) {
//       console.log(err);
//     }
//   }
// }
