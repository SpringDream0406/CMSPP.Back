import { Auth } from 'src/apis/01.Auth/entity/auth.entity';
import { Role, User } from 'src/apis/02.User/entity/user.entity';
import { Solar } from 'src/apis/03.SPP/entity/solar.entity';
import { Repository } from 'typeorm';
import { TestMockData } from './test.mockdata';

export const DBMockData = {
  users(xList: number[], userRepository: Repository<User>): User[] {
    return xList.map((x) =>
      userRepository.create({
        id: x,
        role: Role.USER,
      }),
    );
  },

  auths(xList: number[], authRepository: Repository<Auth>, users: User[]): Auth[] {
    return xList.map((x) =>
      authRepository.create({
        uid: `123e4567-e89b-12d3-a456-42661417400${x}`,
        id: `socialMockId${x}`,
        provider: `social${x}`,
        user: users[x - 1],
        createdAt: new Date(`2024-11-${x}`),
      }),
    );
  },

  spp<T>(xList: number[], repository: Repository<T>, users: User[], mockDto?: any): T[] {
    return xList.flatMap((x) => {
      const dtoName = repository.target.toString().split(' ')[1]; // 제네릭 T에서 이름 추출

      const baseData = {
        id: x,
        user: users[x - 1],
        createdAt: new Date(`2024-11-${x}`),
      };
      const dto = mockDto ?? TestMockData[`add${dtoName}Dto`]({}); // mockDto 받은거 없으면 T에서 추출한 이름으로 dto 넣기
      const changeDate = repository.target === Solar ? { date: `2024-1${x}` } : {}; // solar의 경우 월 중복 안되서 dto의 date 변동 필요

      const data = {
        ...baseData,
        ...dto,
        ...changeDate,
      };
      return repository.create(data);
    });
  },
};
