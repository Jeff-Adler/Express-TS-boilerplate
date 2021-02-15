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
  Length,
  IsNotEmpty,
  IsEmail,
  IsDate,
  MinLength,
} from 'class-validator';
import bcrypt from 'bcrypt';

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
  //TODO: Check if validates pre- or post-hashing string
  @MinLength(8)
  password!: string;

  @Column()
  @IsNotEmpty()
  role!: string;

  @Column()
  @CreateDateColumn()
  @IsDate()
  createdAt!: Date;

  @Column()
  @UpdateDateColumn()
  @IsDate()
  updatedAt!: Date;

  @BeforeInsert()
  async beforeInsert() {
    this.password = await bcrypt.hash(this.password, BCRYPT_HASH_ROUND);
  }
}
