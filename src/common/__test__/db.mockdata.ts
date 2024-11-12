import { Auth } from 'src/apis/01.Auth/entity/auth.entity';
import { Role, User } from 'src/apis/02.User/entity/user.entity';
import { Solar } from 'src/apis/03.SPP/entity/solar.entity';
import { Repository } from 'typeorm';

export const mockingUsers = (xList: number[], userReposityory: Repository<User>) =>
  xList.map((x) =>
    userReposityory.create({
      id: x,
      role: Role.USER,
    }),
  );

export const mockingAuths = (
  xList: number[],
  authReposityory: Repository<Auth>,
  users: User[],
) =>
  xList.map((x) =>
    authReposityory.create({
      uid: `123e4567-e89b-12d3-a456-42661417400${x}`,
      id: `socialMockId${x}`,
      provider: `social${x}`,
      user: users[x - 1],
      createdAt: new Date(`2024-11-${x}`),
    }),
  );

export const mockingSpp = <T>(
  xList: number[],
  repository: Repository<T>,
  users: User[],
  mockDto: any,
): T[] => {
  return xList.flatMap((x) => {
    const data = {
      id: x,
      user: users[x - 1], //
      createdAt: new Date(`2024-11-${x}`),
      ...mockDto,
    };
    if (repository.target === Solar) {
      data['date'] = `2024-1${x}`;
    }
    return repository.create(data);
  });
};
