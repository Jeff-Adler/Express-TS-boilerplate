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
import { UserRoles } from './utils/UserRoles';

const BCRYPT_HASH_ROUND = 8;

@Entity()
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @IsEmail()
  email!: string;

  @Column()
  @MinLength(8)
  password!: string;

  //TODO: Make role be of type UserRoles rather than using UserRoles validation. Might need to make an interface. Might be able to set type directly
  @Column()
  @Validate(RoleValidator)
  role!: keyof UserRoles;

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
    this.password = await bcrypt.hash(this.password, BCRYPT_HASH_ROUND);
  }

  checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
    return bcrypt.compareSync(unencryptedPassword, this.password);
  }
}
