import { DataSource, Repository } from 'typeorm';
import { TasksService } from '../schedule/tasks.service';
import { Role, User } from 'src/apis/02.User/entity/user.entity';
import { Auth } from 'src/apis/01.Auth/entity/auth.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Solar } from 'src/apis/03.SPP/entity/solar.entity';
import { SRec } from 'src/apis/03.SPP/entity/sRec.entity';
import { Expense } from 'src/apis/03.SPP/entity/expense.entity';
import { FixedExpense } from 'src/apis/03.SPP/entity/fixedExpense.entity';
import { DBMockData } from '../data/db.mockdata';

describe('TasksService - Integration Test', () => {
  let tasksService: TasksService;
  let dataSource: DataSource;

  let users: User[];
  let auths: Auth[];
  let solars: Solar[];
  let sRecs: SRec[];
  let expenses: Expense[];
  let fixedExpenses: FixedExpense[];

  let userRepository: Repository<User>;
  let authRepository: Repository<Auth>;
  let solarRepository: Repository<Solar>;
  let sRecRepository: Repository<SRec>;
  let expenseRepository: Repository<Expense>;
  let fixedExpenseRepository: Repository<FixedExpense>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          autoLoadEntities: true,
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([
          Auth, //
          User,
          Solar,
          SRec,
          Expense,
          FixedExpense,
        ]),
      ],
      providers: [TasksService],
    }).compile();

    tasksService = module.get<TasksService>(TasksService);
    dataSource = module.get<DataSource>(DataSource);

    userRepository = dataSource.getRepository(User);
    authRepository = dataSource.getRepository(Auth);
    solarRepository = dataSource.getRepository(Solar);
    sRecRepository = dataSource.getRepository(SRec);
    expenseRepository = dataSource.getRepository(Expense);
    fixedExpenseRepository = dataSource.getRepository(FixedExpense);
  });

  beforeEach(async () => {
    // users = DBMockData.users([1, 2], userRepository);
    // auths = DBMockData.auths([1, 2], authRepository, users);
    // solars = DBMockData.spp<Solar>([1, 2], solarRepository, users);
    // sRecs = DBMockData.spp<SRec>([1, 2], sRecRepository, users);
    // expenses = DBMockData.spp<Expense>([1, 2], expenseRepository, users);
    // fixedExpenses = DBMockData.spp<FixedExpense>([1, 2], fixedExpenseRepository, users);
    // await userRepository.save(users);
    // await authRepository.save(auths);
    // await solarRepository.save(solars);
    // await sRecRepository.save(sRecs);
    // await expenseRepository.save(expenses);
    // await fixedExpenseRepository.save(fixedExpenses);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('should be defined', () => {
    expect(tasksService).toBeDefined();
  });

  // it('a', async () => {
  //   const qr = dataSource.createQueryRunner();

  //   await qr.connect();
  //   console.log(await qr.manager.find(User));
  //   await qr.startTransaction();
  //   await qr.manager.save(User, { role: Role.USER });
  //   await qr.rollbackTransaction();
  //   console.log(await qr.manager.find(User));
  //   console.log(await userRepository.find());
  //   await qr.release();
  //   await qr.connect();
  //   console.log(await qr.manager.find(User));
  // });

  // --
  // describe('removeSoftDeletedUsers', () => {
  //   // --
  //   it('회원탈퇴 7일 이상인 사용자 정보 전체 삭제', async () => {
  //     // 2명의 데이터 삽입 제대로 되어있나 확인
  //     const authBefore = await authRepository.find();
  //     const userBefore = await userRepository.find();
  //     const solarBefore = await solarRepository.find();
  //     const sRecBefore = await sRecRepository.find();
  //     const expenseBefore = await expenseRepository.find();
  //     const fixedExpenseBefore = await fixedExpenseRepository.find();

  //     expect(authBefore).toHaveLength(2);
  //     expect(userBefore).toHaveLength(2);
  //     expect(solarBefore).toHaveLength(2);
  //     expect(sRecBefore).toHaveLength(2);
  //     expect(expenseBefore).toHaveLength(2);
  //     expect(fixedExpenseBefore).toHaveLength(2);

  //     // 1명의 탈퇴일을 7일 이상의 날짜로 변경
  //     const deletedUserId = 1;

  //     const updateResult = await userRepository.update(
  //       { id: deletedUserId },
  //       { deletedAt: new Date(`2024-01-01`) },
  //     );

  //     expect(updateResult.affected).toBe(1);

  //     // 삭제 실행
  //     await tasksService.removeSoftDeletedUsers();

  //     // 1명의 데이터 삭제 되어 전부 남은 1명의 데이터만 있나 확인
  //     const authAfter = await authRepository.find({
  //       relations: { user: true },
  //     });
  //     const userAfter = await userRepository.find();
  //     const solarAfter = await solarRepository.find();
  //     const sRecAfter = await solarRepository.find();
  //     const expenseAfter = await solarRepository.find();
  //     const fixedExpenseAfter = await solarRepository.find();

  //     expect(authAfter).toHaveLength(1);
  //     expect(authAfter[0].user.id).not.toBe(deletedUserId);
  //     expect(userAfter).toHaveLength(1);
  //     expect(solarAfter).toHaveLength(1);
  //     expect(sRecAfter).toHaveLength(1);
  //     expect(expenseAfter).toHaveLength(1);
  //     expect(fixedExpenseAfter).toHaveLength(1);
  //   });
  // });
});
