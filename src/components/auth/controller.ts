import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { Repository, getConnection } from 'typeorm';

import { User } from '../user/model';

export class AuthController {
  public async login(req: Request, res: Response): Promise<Response> {
    let { email, password } = req.body;
    if (!(email && password)) {
      return res.status(400).send('Request body lacked fields: email and/or password');
    }

    const userRepository: Repository<User> = getConnection(process.env.CONNECTION_TYPE).getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail({ where: { email } });

      if (!user.checkIfUnencryptedPasswordIsValid(password)) {
        return res.status(401).send('Invalid password');
      }

      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET as jwt.Secret, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });

      return res.status(200).send({ token });
    } catch (error) {
      return res.status(401).send(`User with email address "${email}" not found`);
    }
  }
}
