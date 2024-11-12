import { DataSource, Repository } from 'typeorm';
import { AuthService } from '../auth.service';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth } from '../entity/auth.entity';
import { Role, User } from 'src/apis/02.User/entity/user.entity';
import { Solar } from 'src/apis/03.SPP/entity/solar.entity';
import { SRec } from 'src/apis/03.SPP/entity/sRec.entity';
import { Expense } from 'src/apis/03.SPP/entity/expense.entity';
import { FixedExpense } from 'src/apis/03.SPP/entity/fixedExpense.entity';
import { UserService } from 'src/apis/02.User/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { mockReqUser, mockRes, mockUserId } from 'src/common/__test__/test.mockdata';
import { validationSchema } from 'src/common/config/validation.schema';

console.log(`.env${process.env.NODE_ENV ?? ''}`);

describe('AuthService - Integration Test', () => {
  let authService: AuthService;
  let userService: UserService;
  let dataSource: DataSource;

  let authRepository: Repository<Auth>;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          validationSchema: validationSchema,
          envFilePath: `.env${process.env.NODE_ENV ?? ''}`,
        }), //
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

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signUp', () => {
    it('회원가입', async () => {
      // 비었나 확인
      const beforeAuth = await authRepository.find();
      const beforeUser = await userRepository.find();

      expect(beforeAuth).toHaveLength(0);
      expect(beforeUser).toHaveLength(0);

      // 가입 잘 되었나 확인
      await authService.signUp({ user: mockReqUser, res: mockRes });

      const afterAuth = await authRepository.find({ relations: { user: true } });
      const afterUser = await userRepository.find();

      expect(afterAuth).toHaveLength(1);
      expect(afterUser).toHaveLength(1);

      expect(afterAuth[0].id).toBe(mockReqUser.id);
      expect(afterAuth[0].provider).toBe(mockReqUser.provider);
      expect(afterAuth[0].user.id).toBe(afterUser[0].id);
      expect(afterUser[0].role).toBe(Role.USER);

      expect(afterAuth[0].user.deletedAt).toBeNull();
      expect(afterUser[0].deletedAt).toBeNull();
    });

    it('회원 탈퇴 후 재가입', async () => {
      // 회원가입으로 가입된 1명 회원 탈퇴
      const result = await userService.withdrawal({ userId: mockUserId });

      expect(result.affected).toBe(1);

      const dAfterAuth = await authRepository.find();
      const dAfterUser = await userRepository.find();
      const dAfterAuthWithDeleted = await authRepository.find({
        relations: { user: true },
        withDeleted: true,
      });
      const dAfterUserWithDeleted = await userRepository.find({
        withDeleted: true,
      });

      expect(dAfterAuth).toHaveLength(1);
      expect(dAfterUser).toHaveLength(0); // softDeleted 일반 조회 안됨

      expect(dAfterAuthWithDeleted[0].user).toHaveProperty('id');
      expect(dAfterAuthWithDeleted[0].user).toHaveProperty('deletedAt');
      expect(dAfterAuthWithDeleted[0].user.deletedAt).not.toBeNull(); // softDeleted
      expect(dAfterUserWithDeleted).toHaveLength(1); // withDeleted로 조회 됨
      expect(dAfterUserWithDeleted[0].deletedAt).not.toBeNull(); // softDeleted

      // 회원 재 가입
      await authService.signUp({ user: mockReqUser, res: mockRes });

      const afterAuth = await authRepository.find({
        relations: { user: true },
      });
      const afterUser = await userRepository.find();

      expect(afterAuth).toHaveLength(1);
      expect(afterAuth[0].user.deletedAt).toBeNull();
      expect(afterUser).toHaveLength(1);
      expect(afterUser[0].deletedAt).toBeNull();
    });
  });
});
