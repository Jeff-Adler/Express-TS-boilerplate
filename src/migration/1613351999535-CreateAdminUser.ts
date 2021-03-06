import { MigrationInterface, QueryRunner, getRepository, getConnection } from 'typeorm';
import { User } from '../components/user/model';

export class CreateAdminUser1613351999535 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    let user = new User();
    user.email = 'admin@admin.com';
    user.password = 'admin_password';
    user.role = 'ADMIN';
    const userRepository = getConnection('development').getRepository(User);
    await userRepository.save(user);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
