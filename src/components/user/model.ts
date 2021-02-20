import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  IsEmail,
  // IsDate,
  MinLength,
  Validate,
} from 'class-validator';
import bcrypt from 'bcrypt';

import { RoleValidator } from './utils/RoleValidator';
import { Role } from './utils/Roles';

export type UpdateableUserField = keyof IUser;

export interface IUser {
  email: string;
  password: string;
  role: Role;
}

@Entity()
@Unique(['email'])
export class User implements IUser {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @IsEmail()
  email!: string;

  @Column()
  @MinLength(8)
  password!: string;

  // Coerce custom Role type as permitted postgresql type
  @Column('character varying')
  @Validate(RoleValidator)
  role!: Role;

  @Column()
  @CreateDateColumn()
  // @IsDate()
  createdAt!: Date;

  @Column()
  @UpdateDateColumn()
  // @IsDate()
  updatedAt!: Date;

  @BeforeInsert()
  async beforeInsert() {
    this.password = await bcrypt.hash(
      this.password,
      process.env.BCRYPT_HASH_ROUND!
    );
  }

  checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
    return bcrypt.compareSync(unencryptedPassword, this.password);
  }
}
