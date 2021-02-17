import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { getRepository, Repository } from 'typeorm';
import { validate } from 'class-validator';

import { User } from '../user/model';

export class AuthController {
  public async login(req: Request, res: Response) {
    //Check if email and password are set
    let { email, password } = req.body;
    if (!(email && password)) {
      res.status(400).send();
    }

    //Get user from database
    const userRepository: Repository<User> = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail({ where: { email } });

      //Check if encrypted password match
      if (!user.checkIfUnencryptedPasswordIsValid(password)) {
        res.status(401).send();
        return;
      }

      //Sing JWT, valid for 1 hour
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET as jwt.Secret,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      //Send the jwt in the response
      res.send({ token });
    } catch (error) {
      res.status(401).send();
    }
  }

  public async changePassword(req: Request, res: Response) {
    //Get ID from JWT, set in checkJwt (I believe)
    const id = res.locals.jwtPayload.userId;

    //Get parameters from the body
    const { oldPassword, newPassword } = req.body;
    if (!(oldPassword && newPassword)) {
      res.status(400).send();
    }

    //Get user from the database
    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail(id);
      //Check if old password matchs
      if (!user.checkIfUnencryptedPasswordIsValid(oldPassword)) {
        res.status(401).send();
        return;
      }

      user.password = newPassword;
      //Validate model
      const errors = await validate(user);
      if (errors.length > 0) {
        res.status(400).send(errors);
        return;
      }
      userRepository.save(user);

      res.status(204).send();
    } catch (id) {
      res.status(401).send();
    }
  }
}
