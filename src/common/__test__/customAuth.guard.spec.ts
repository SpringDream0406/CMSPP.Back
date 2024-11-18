import { CustomAuthGuard } from '../guard/customAuth.guard';
import { CommonService } from '../common.service';
import { TestMockData } from '../data/test.mockdata';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { validationSchema } from '../config/validation.schema';
import { AuthService } from 'src/apis/01.Auth/auth.service';
import { UserService } from 'src/apis/02.User/user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/apis/02.User/entity/user.entity';
import { Auth } from 'src/apis/01.Auth/entity/auth.entity';
import { UnauthorizedException } from '@nestjs/common';

describe('CustomAuthGuard', () => {
  let customAuthGuard: CustomAuthGuard;

  let commonService: CommonService;
  let authService: AuthService;

  let refreshToken: string;
  let expiredRefreshToken: string;
  let accessToken: string;
  let expiredAccessToken: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          validationSchema: validationSchema,
          envFilePath: `.env${process.env.NODE_ENV ?? ''}`,
        }),
      ],
      providers: [
        CustomAuthGuard, //
        CommonService,
        JwtService,
        AuthService,
        UserService,
        {
          provide: getRepositoryToken(Auth),
          useValue: TestMockData.repository(),
        },
        {
          provide: getRepositoryToken(User), //
          useValue: TestMockData.repository(),
        },
      ],
    }).compile();

    customAuthGuard = module.get(CustomAuthGuard);
    commonService = module.get(CommonService);

    authService = await module.get(AuthService);

    const userId = 1;
    refreshToken = authService.getToken({ userId, isRefresh: true });
    expiredRefreshToken = authService.getExpiredToken({ userId, isRefresh: true });
    accessToken = authService.getToken({ userId });
    expiredAccessToken = authService.getExpiredToken({ userId });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(customAuthGuard).toBeDefined;
  });

  describe('canActivate', () => {
    it('Public()가 있고, refresh가 아닌 경우', async () => {
      // given
      const req = TestMockData.req();
      const context = TestMockData.executionContext(req);

      jest.spyOn(commonService, 'getMetaData').mockReturnValue({});

      // when
      const result = await customAuthGuard.canActivate(context);

      // then
      expect(result).toBe(true);
    });

    it.each([
      ['cookie', 'refresh'],
      ['authorization', undefined],
    ])('통과 %s', async (header, isPublic) => {
      // given
      const req = TestMockData.req();
      req.headers[header] =
        isPublic === 'refresh' ? `refreshToken=${refreshToken}` : `Bearer ${accessToken}`;
      const context = TestMockData.executionContext(req);

      jest.spyOn(commonService, 'getMetaData').mockReturnValue(isPublic);

      // when
      const result = await customAuthGuard.canActivate(context);

      // then
      expect(result).toBe(true);
      expect(req.user).toHaveProperty('userId');
    });

    it.each([
      ['cookie', 'refresh'],
      ['authorization', undefined],
    ])('실패, 토큰 잘못됨 %s', async (header, isPublic) => {
      // given
      const req = TestMockData.req();
      req.headers[header] = 'token';
      const context = TestMockData.executionContext(req);

      jest.spyOn(commonService, 'getMetaData').mockReturnValue(isPublic);

      // when
      const result = await customAuthGuard.canActivate(context);

      // then
      expect(result).toBe(false);
    });

    it.each([
      ['expired', 'cookie', 'refresh'],
      ['expired', 'authorization', undefined],
      ['잘못된', 'cookie', 'refresh'],
      ['잘못된', 'authorization', undefined],
    ])('오류, %s token', async (message, header, isPublic) => {
      // given
      const expired = message === 'expired';
      const req = TestMockData.req();
      req.headers[header] =
        isPublic === 'refresh'
          ? `refreshToken=${expired ? expiredRefreshToken : 'toekn'}`
          : `Bearer ${expired ? expiredAccessToken : 'token'}`;
      const context = TestMockData.executionContext(req);

      jest.spyOn(commonService, 'getMetaData').mockReturnValue(isPublic);

      // when & then
      await expect(customAuthGuard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
