import { Auth } from 'src/apis/01.Auth/entity/auth.entity';
import { Role, User } from 'src/apis/02.User/entity/user.entity';
import { Solar } from 'src/apis/03.SPP/entity/solar.entity';
import { EntityManager } from 'typeorm';
import { TestMockData } from './test.mockdata';
import { SRec } from 'src/apis/03.SPP/entity/sRec.entity';
import { Expense } from 'src/apis/03.SPP/entity/expense.entity';
import { FixedExpense } from 'src/apis/03.SPP/entity/fixedExpense.entity';

export const getEntitis = () => {
  return [Auth, User, Solar, SRec, Expense, FixedExpense];
};

export class DBDataFactory {
  private readonly entities = {
    Solar,
    SRec,
    Expense,
    FixedExpense,
  };

  constructor(private readonly entityManager: EntityManager) {}

  createUsers(xList: number[]): User[] {
    return xList.map((x) =>
      this.entityManager.create(User, {
        kWh: 100,
        recWeight: 1,
        businessNumber: `12345678${x}`,
        address: 'mockAddress',
        role: Role.USER,
      }),
    );
  }

  createAuths(xList: number[], users: User[]): Auth[] {
    return xList.map((x) =>
      this.entityManager.create(Auth, {
        id: `test_${x}`,
        provider: `google`,
        user: users[x - 1],
      }),
    );
  }

  createSpp(
    xList: number[],
    entity: keyof DBDataFactory['entities'],
    users: User[],
    sameUser: boolean = false,
    mockDto?: any,
  ) {
    return xList.flatMap((x) => {
      const baseData = {
        id: x,
        user: sameUser ? users[0] : users[x - 1],
      };
      const dto = mockDto ?? TestMockData[`add${entity}Dto`]({});
      const changeDate = entity === 'Solar' ? { date: `2024-0${x}` } : {};

      const data = {
        ...baseData,
        ...dto,
        ...changeDate,
      };

      return this.entityManager.create(this.entities[entity], data);
    });
  }

  async insertUsers(xList: number[]): Promise<User[]> {
    const users = this.createUsers(xList);
    await this.entityManager.insert(User, users);
    return users;
  }

  async insertAuths(xList: number[], users: User[]): Promise<void> {
    const auths = this.createAuths(xList, users);
    await this.entityManager.insert(Auth, auths);
  }

  async insertSpps(
    xList: number[],
    users: User[],
    sameUser: boolean = false,
  ): Promise<void> {
    for (const entity of Object.keys(this.entities) as Array<
      keyof DBDataFactory['entities']
    >) {
      const spp = this.createSpp(xList, entity, users, sameUser);
      await this.entityManager.insert(this.entities[entity], spp);
    }
  }

  async insertUsersAndAuths(xList: number[]) {
    const users = await this.insertUsers(xList);
    await this.insertAuths(xList, users);
    return users;
  }

  async insertDatas(xList: number[], sameUser: boolean = false): Promise<void> {
    const users = await this.insertUsersAndAuths(xList);
    await this.insertSpps(xList, users, sameUser);
  }
}
