import { Auth } from 'src/apis/01.Auth/entities/auth.entity';
import { Role, User } from 'src/apis/02.User/entities/user.entity';
import { Repository } from 'typeorm';

export const mockingUsers = (userReposityory: Repository<User>) =>
  [1, 2].map((x) =>
    userReposityory.create({
      id: x,
      role: Role.USER,
    }),
  );

export const mockingAuths = (authReposityory: Repository<Auth>, users: User[]) =>
  [1, 2].map((x) =>
    authReposityory.create({
      uid: `123e4567-e89b-12d3-a456-42661417400${x}`,
      id: `socialMockId${x}`,
      provider: `social${x}`,
      user: users[x - 1],
      createdAt: new Date(`2024-11-${x}`),
      deletedAt: null,
    }),
  );
