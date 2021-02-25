// import { Repository, getRepository } from 'typeorm';
// import { IUser, User } from './model';

// export class UserService {
//   public async update(user: User, updates: keyof IUser[]) {

//     // Validation 2: fields on req.body are updateable User fields
//     const isUpdateableUserField = (update: string): update is UpdateableUserField => {
//       return <UpdateableUserField>update !== undefined;
//     };

//     if (!updates.every((update) => isUpdateableUserField(update))) {
//       res.status(400).send({ error: 'Field cannot be updated' });
//     }
//   };

// //TODO: Delete once no longer necessary
// public async create(): Promise<User> {
//   try {
//     let user = new User();
//     user.email = faker.internet.email();
//     user.password = faker.internet.password();
//     user.firstName = faker.name.firstName();
//     user.lastName = faker.name.lastName();
//     user.age = Math.floor(Math.random() * (70 - 18 + 1) + 18);

//     return await this.repo.save(user);
//   } catch (err) {
//     return err;
//   }
// }

// //TODO: Input query parameters
// public async readAll(): Promise<User[]> {
//   try {
//     console.log('Loading users from the database...');
//     return await this.repo.find({});
//   } catch (err) {
//     return err;
//   }
// }

// public async readUserById(id: number): Promise<User[]> {
//   try {
//     console.log('Loading users from the database...');
//     return await this.repo.find({ where: { id: id } });
//   } catch (err) {
//     return err;
//   }
// }

// public async deleteUserById(id: number): Promise<User[]> {
//   try {
//     console.log('Deleting user from the database...');
//     const user = await this.repo.find({ where: { id: id } });
//     return await this.repo.remove(user);
//   } catch (err) {
//     return err;
//   }
// }
// }
