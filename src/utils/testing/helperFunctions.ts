import { getConnection } from 'typeorm';
import { User } from '../../components/user/model';

export const getOneMaxId = async (): Promise<number> => {
  const query = getConnection(process.env.CONNECTION_TYPE).getRepository(User).createQueryBuilder('user');
  query.select('MAX(user.id)', 'max');
  const result = await query.getRawOne();
  return result.max;
};
