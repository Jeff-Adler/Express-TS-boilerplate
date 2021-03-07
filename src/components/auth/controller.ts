import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { Repository, getConnection } from 'typeorm';

import { User } from '../user/model';

export class AuthController {
  public async login(req: Request, res: Response) {
    let { email, password } = req.body;
    if (!(email && password)) {
      res.status(400).send('Request body lacked fields: email and/or password');
    }

    const userRepository: Repository<User> = getConnection(process.env.CONNECTION_TYPE).getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail({ where: { email } });

      if (!user.checkIfUnencryptedPasswordIsValid(password)) {
        res.status(401).send('Invalid password');
        return;
      } else {
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET as jwt.Secret, {
          expiresIn: process.env.JWT_EXPIRES_IN,
        });

        res.status(200).send({ token });
        return;
      }
    } catch (error) {
      res.status(401).send(`User with email address "${email}" not found`);
      return;
      // return res.status(401).json({ error: `User with email address "${email}" not found` });
    }
  }
}
