import { DataSource, Repository } from 'typeorm';
import { AuthService } from '../auth.service';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth } from '../entity/auth.entity';
import { User } from 'src/apis/02.User/entity/user.entity';
import { UserService } from 'src/apis/02.User/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validationSchema } from 'src/common/config/validation.schema';
import { TestMockData } from 'src/common/data/test.mockdata';
import { IBackup, newDb } from 'pg-mem';
import { initPgMem } from 'src/common/config/initPgMem';
import { DBDataFactory, getEntitis } from 'src/common/data/db.mockdata';
import { createResponse } from 'node-mocks-http';

describe('AuthServcie_Integration', () => {
  let authService: AuthService;
  let userService: UserService;
  let configService: ConfigService;

  let authRepository: Repository<Auth>;
  let userRepository: Repository<User>;

  let dataSource: DataSource;
  let dBDataFactory: DBDataFactory;
  let backup: IBackup;

  beforeAll(async () => {
    const db = newDb();
    const entities = getEntitis();
    dataSource = await initPgMem('AuthServcie_Integration', db, entities);

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          validationSchema: validationSchema,
          envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
        }),
        TypeOrmModule.forRoot(),
        TypeOrmModule.forFeature(entities),
      ],
      providers: [
        AuthService, //
        UserService,
        JwtService,
      ],
    })
      .overrideProvider(DataSource)
      .useValue(dataSource)
      .compile();

    authService = module.get(AuthService);
    userService = module.get(UserService);
    configService = module.get(ConfigService);

    authRepository = dataSource.getRepository(Auth);
    userRepository = dataSource.getRepository(User);

    const entityManager = dataSource.createEntityManager();
    dBDataFactory = new DBDataFactory(entityManager);

    backup = db.backup();
  });

  afterEach(() => {
    backup.restore();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signUp', () => {
    it('회원가입', async () => {
      // given
      const user_1 = TestMockData.reqUser({ id: 'test_1' });
      const user_2 = TestMockData.reqUser({ id: 'test_2' });
      const res_1 = createResponse();
      const res_2 = createResponse();

      // when
      await authService.signUp({ user: user_1, res: res_1 }); // 회원 가입
      await authService.signUp({ user: user_2, res: res_2 });
      const AfterAuth = await authRepository.find();
      const AfterUser = await userRepository.find();

      // then
      expect(AfterAuth).toHaveLength(2); // 가입된 회원수 이상 없나
      expect(AfterUser).toHaveLength(2);
      expect(res_1.cookies.refreshToken.value).toBeDefined(); // 쿠키에 refreshToken 있나
      expect(res_2.cookies.refreshToken.value).toBeDefined(); // 쿠키에 refreshToken 있나
    });

    it('회원 탈퇴 후 재가입', async () => {
      // given
      await dBDataFactory.insertUsersAndAuths([1, 2]);
      const user_1 = TestMockData.reqUser({ id: 'test_1' });
      const res = createResponse();
      const authOfUser_1 = await authRepository.findOne({
        where: { id: 'test_1' },
        relations: { user: true },
      });
      await userService.withdrawal({ userId: authOfUser_1.user.id }); // 1명 회원 탈퇴

      // when
      await authService.signUp({ user: user_1, res }); // 회원 재 가입

      const auth = await authRepository.findOne({
        where: { id: authOfUser_1.id },
        relations: { user: true },
      });
      const user = await userRepository.findOne({
        where: { id: authOfUser_1.user.id },
      });
      const auths = await authRepository.find();
      const users = await userRepository.find();

      // then
      expect(auths).toHaveLength(2); // 회원수 이상 없나
      expect(users).toHaveLength(2);
      expect(auth.user).not.toBeNull(); // restore 제대로 되었나
      expect(user.deletedAt).toBeNull();
      expect(auth.user.id).toBe(user.id);
      expect(res.cookies.refreshToken.value).toBeDefined(); // 쿠키에 refreshToken 있나
    });

    it('로그인', async () => {
      // given
      await dBDataFactory.insertUsersAndAuths([1, 2]);
      const user_1 = TestMockData.reqUser({ id: 'test_1' });
      const res = createResponse();

      // when
      await authService.signUp({ user: user_1, res }); // 로그인
      const auths = await authRepository.find();
      const users = await userRepository.find();

      // then
      expect(auths).toHaveLength(2); // 회원수 이상 없나
      expect(users).toHaveLength(2);
      expect(res.cookies.refreshToken.value).toBeDefined(); // 쿠키에 refreshToken 있나
    });
  });

  describe('로그아웃', () => {
    it.each(['test', 'dev', 'prod'])('로그아웃 = 쿠키 삭제, env = %s', (env) => {
      // given
      const res = createResponse();

      jest.spyOn(configService, 'getOrThrow').mockReturnValue(env);

      authService.setCookie({ userId: 1, res });
      expect(res.cookies.refreshToken.value).not.toBe('');

      // when
      authService.logOut(res);

      //then
      expect(res.cookies.refreshToken.value).toBe('');
    });
  });

  describe('토큰 발급', () => {
    it.each([
      ['refreshToken', true],
      ['accessToken', false],
    ])('%s', (_, isRefresh) => {
      // given
      const userId = 1;
      const result = authService.getToken({ userId, isRefresh });

      // then
      expect(result).toBeDefined();
      const parts = result.split('.');
      expect(parts).toHaveLength(3);
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
      expect(payload.sub).toBe(userId);
    });
  });

  describe('setCookie', () => {
    it.each(['test', 'dev', 'prod'])('리프래시토큰 쿠키에 담기, env = %s', (env) => {
      // given
      const userId = 1;
      const res = createResponse();

      jest.spyOn(configService, 'get').mockReturnValue(env);

      // when
      authService.setCookie({ userId, res });

      // then
      expect(res.cookies.refreshToken.value).toBeDefined();
    });
  });
});
