import { AuthService } from '../auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/apis/02.User/user.service';
import { Auth } from '../entity/auth.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/apis/02.User/entity/user.entity';
import { DataSource } from 'typeorm';
import { validationSchema } from 'src/common/config/validation.schema';
import { TestMockData } from 'src/common/data/test.mockdata';

describe('AuthService (Unit)', () => {
  let authService: AuthService;
  let userService: UserService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          validationSchema: validationSchema,
          envFilePath: `.env${process.env.NODE_ENV ?? ''}`,
        }),
      ],
      providers: [
        AuthService,
        UserService,
        JwtService,
        DataSource,
        {
          provide: getRepositoryToken(Auth),
          useValue: TestMockData.repository(),
        },
        {
          provide: getRepositoryToken(User), //
          useValue: TestMockData.repository(),
        },
        {
          provide: DataSource,
          useValue: TestMockData.repository(),
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  // --
  describe('signUp', () => {
    const user = TestMockData.reqUser({}); // reqUser 같음

    // --
    it('로그인: auth(DB)에 데이터가 있을 때, 데이터 그대로 씀', async () => {
      const auth = TestMockData.auth({});
      const res = TestMockData.res();

      jest.spyOn(authService, 'findOneByUserFromAuth').mockResolvedValue(auth);

      await authService.signUp({ user, res });

      expect(res.getHeader('set-cookie')).toContain(`refreshToken=`);
    });

    // --
    it('재가입: user(DB)에 softDelete된 데이터가 있을 때, 기존 데이터를 restore 하고 사용함.', async () => {
      const softDeletedMockAuth = TestMockData.auth({
        deletedAt: new Date('2024-01-01'),
      });
      const updateResult_1 = TestMockData.updateResult({ affected: 1 });
      const res = TestMockData.res();

      jest
        .spyOn(authService, 'findOneByUserFromAuth')
        .mockResolvedValue(softDeletedMockAuth);
      jest.spyOn(userService, 'restoreUser').mockResolvedValue(updateResult_1);

      await authService.signUp({ user, res });

      expect(res.getHeader('set-cookie')).toContain(`refreshToken=`);
    });

    // --
    it('회원가입: auth(DB)에 데이터가 없을 때, 회원가입 후 반환된 데이터 씀', async () => {
      const res = TestMockData.res();
      const auth = TestMockData.auth({});

      jest.spyOn(authService, 'findOneByUserFromAuth').mockResolvedValue(null);
      jest.spyOn(authService, 'saveUser').mockResolvedValue(auth);

      await authService.signUp({ user, res });

      expect(res.getHeader('set-cookie')).toContain(`refreshToken=`);
    });
  });

  // --
  describe('토큰 발급', () => {
    // --
    it.each([
      ['accessToken', 'getAccessToken', '15m'],
      ['refreshToken', 'getRefreshToken', '24h'],
    ])('%s', (_, method) => {
      const userId = 1;

      const result = authService[method]({ userId });

      expect(result).toBeDefined();
      const parts = result.split('.');
      expect(parts).toHaveLength(3);
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
      expect(payload.sub).toBe(userId);
    });
  });

  // --
  describe('setRefreshToken', () => {
    // --
    it.each(['test', 'dev', 'prod'])('리프래시토큰 쿠키에 담기 - %s', (env) => {
      const userId = 1;
      const res = TestMockData.res();

      jest.spyOn(configService, 'get').mockReturnValue(env);

      authService.setRefreshToken({ userId, res });

      expect(res.getHeader('set-cookie')).toContain(`refreshToken=`);
    });
  });
});
