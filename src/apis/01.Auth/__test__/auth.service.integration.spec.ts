import { DataSource, Repository } from 'typeorm';
import { AuthService } from '../auth.service';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth } from '../entity/auth.entity';
import { User } from 'src/apis/02.User/entity/user.entity';
import { Solar } from 'src/apis/03.SPP/entity/solar.entity';
import { SRec } from 'src/apis/03.SPP/entity/sRec.entity';
import { Expense } from 'src/apis/03.SPP/entity/expense.entity';
import { FixedExpense } from 'src/apis/03.SPP/entity/fixedExpense.entity';
import { UserService } from 'src/apis/02.User/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { validationSchema } from 'src/common/config/validation.schema';
import { TestMockData } from 'src/common/data/test.mockdata';

describe('AuthService (Integration)', () => {
  let authService: AuthService;
  let userService: UserService;
  let dataSource: DataSource;

  let authRepository: Repository<Auth>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          validationSchema: validationSchema,
          envFilePath: `.env${process.env.NODE_ENV ?? ''}`,
        }),
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
      providers: [
        AuthService, //
        UserService,
        JwtService,
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    dataSource = module.get<DataSource>(DataSource);

    authRepository = dataSource.getRepository(Auth);
    userRepository = dataSource.getRepository(User);
  });

  afterEach(async () => {
    await dataSource.destroy();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  // --
  describe('signUp', () => {
    // --
    it('회원가입, 회원 탈퇴 후 재가입', async () => {
      // 비었나 확인
      const beforeAuth = await authRepository.find();
      const beforeUser = await userRepository.find();

      expect(beforeAuth).toHaveLength(0);
      expect(beforeUser).toHaveLength(0);

      // 가입, 잘 되었나 확인
      const user_1 = TestMockData.reqUser({ id: 'test_1' });
      const user_2 = TestMockData.reqUser({ id: 'test_2' });
      const res = TestMockData.res();

      await authService.signUp({ user: user_1, res });
      await authService.signUp({ user: user_2, res });

      const AfterAuth = await authRepository.find();
      const AfterUser = await userRepository.find();

      expect(AfterAuth).toHaveLength(2);
      expect(AfterUser).toHaveLength(2);

      // 1명 회원 탈퇴
      const userId_1 = AfterUser[0].id;
      const result = await userService.withdrawal({ userId: userId_1 });

      expect(result.affected).toBe(1);

      const dAfterAuth = await authRepository.find();
      const dAfterUser = await userRepository.find();

      expect(dAfterAuth).toHaveLength(2);
      expect(dAfterUser).toHaveLength(1); // softDeleted 일반 조회 안됨

      const dAfterAuthWithDeleted = await authRepository.find({
        relations: { user: true },
        withDeleted: true,
      });
      const dAfterUserWithDeleted = await userRepository.find({
        withDeleted: true,
      });

      expect(dAfterAuthWithDeleted[0].user).toHaveProperty('id');
      expect(dAfterAuthWithDeleted[0].user).toHaveProperty('deletedAt');
      expect(dAfterAuthWithDeleted[0].user.deletedAt).not.toBeNull(); // softDeleted
      expect(dAfterUserWithDeleted).toHaveLength(2); // withDeleted로 조회 됨
      expect(dAfterUserWithDeleted[0].deletedAt).not.toBeNull(); // softDeleted 더블체크

      // 회원 재 가입
      await authService.signUp({ user: user_1, res });

      const afterAuth = await authRepository.find({
        relations: { user: true },
      });
      const afterUser = await userRepository.find();

      expect(afterAuth).toHaveLength(2);
      expect(afterAuth[0].user.deletedAt).toBeNull();
      expect(afterUser).toHaveLength(2);
      expect(afterUser[0].deletedAt).toBeNull();
    });
  });
});
