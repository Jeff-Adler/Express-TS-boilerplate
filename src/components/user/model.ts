import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeUpdate,
  AfterLoad,
  BeforeRemove,
} from 'typeorm';
import { IsEmail, MinLength } from 'class-validator';
import bcrypt from 'bcrypt';

import { RoleValidator } from './utils/RoleValidator';
import { Role } from './utils/Roles';

export const UpdateableUserFields = ['email', 'password', 'role'] as const;

export type UpdateableUserField = typeof UpdateableUserFields[number];

export interface IUser {
  id: number;
  email: string;
  password: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
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
  @RoleValidator()
  role!: Role;

  @Column()
  @CreateDateColumn()
  createdAt!: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt!: Date;

  @BeforeInsert()
  private async hashPassword(): Promise<void> {
    this.password = await bcrypt.hash(this.password, parseInt(process.env.BCRYPT_HASH_ROUND!));
  }

  // Minor hack to ensure that encryptPassword() only triggers when password is updated, as opposed to other fields
  private tempPassword!: string;

  @AfterLoad()
  private loadTempPassword(): void {
    this.tempPassword = this.password;
  }

  @BeforeUpdate()
  private async encryptPassword(): Promise<void> {
    if (this.tempPassword !== this.password) {
      await this.hashPassword();
    }
  }

  public checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
    return bcrypt.compareSync(unencryptedPassword, this.password);
  }
}
