import { CommonService } from '../common.service';
import { JwtService } from '@nestjs/jwt';
import { TestMockData } from '../data/test.mockdata';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envKeys, validationSchema } from '../config/validation.schema';
import { UnauthorizedException } from '@nestjs/common';

describe('CommonService_Unit', () => {
  let commonService: CommonService;
  let configService: ConfigService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          validationSchema: validationSchema,
          envFilePath: `.env${process.env.NODE_ENV ?? ''}`,
        }),
      ],
      providers: [
        CommonService, //
        JwtService,
      ],
    }).compile();

    commonService = module.get(CommonService);
    configService = module.get(ConfigService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(commonService).toBeDefined();
  });

  describe('parseRefreshToken', () => {
    it('쿠키에서 refreshToken 가져오기 성공', () => {
      // given
      const refreshToken = 'mockRefreshToken';
      const req = TestMockData.req();
      req.headers.cookie = `refreshToken=${refreshToken}`;

      // when
      const result = commonService.parseRefreshToken(req);

      // then
      expect(result).toBe(refreshToken);
    });

    it.each([
      ['cookie가 비어있는 경우', ''],
      ['refresh 글자가 없는 경우', '=mockRefreshToken'],
      ['refresh 대신 다른 글자가 있는 경우', 'mock=mockRefreshToken'],
      ['refreshToken이 없는 경우', 'refreshToken='],
      ['잘못된 토큰 형식', 'test'],
    ])('쿠키에서 refreshToken 가져오기 실패: %s', (_, cookie) => {
      // given
      const req = TestMockData.req();
      req.headers.cookie = cookie;

      // when
      const result = commonService.parseRefreshToken(req);

      // then
      expect(result).toBe(false);
    });
  });

  describe('parseAccessToken', () => {
    it('authorization에서 accessToken 가져오기 성공', () => {
      // given
      const accessToken = 'mockAccessToken';
      const req = TestMockData.req();
      req.headers.authorization = `Bearer ${accessToken}`;

      // when
      const result = commonService.parseAccessToken(req);

      // then
      expect(result).toBe(accessToken);
    });

    it.each([
      ['authorization가 비어있는 경우', ''],
      ['Bearer 글자가 없는 경우', ' mockAccessToken'],
      ['Bearer 대신 다른 글자가 있는 경우', 'mock mockAccessToken'],
      ['accessToken이 없는 경우', `Bearer `],
      ['잘못된 토큰 형식', 'test'],
    ])('authorization에서 accessToken 가져오기 실패: %s', (_, Bearer) => {
      // given
      const req = TestMockData.req();
      req.headers.authorization = `${Bearer}`;

      // when
      const result = commonService.parseAccessToken(req);

      // then
      expect(result).toBe(false);
    });
  });

  describe('getToken', () => {
    it.each([
      ['cookie가 정상일 때', 'refreshToken=token', 'token'],
      ['cookie에 문제가 있을 때', '', false],
    ])('refresh 일 때: %s', (_, cookie, expectResult) => {
      // given
      const req = TestMockData.req();
      req.headers.cookie = cookie;

      // when
      const result = commonService.returnToken({ isRefresh: true, req });

      // then
      expect(result).toBe(expectResult);
    });

    it.each([
      ['authorization이 정상일 때', 'Bearer token', 'token'],
      ['authorization에 문제가 있을 때', '', false],
    ])('access 일 때, mockReturnValue: %s', (_, Bearer, expectResult) => {
      // given
      const req = TestMockData.req();
      req.headers.authorization = Bearer;

      // when
      const result = commonService.returnToken({ isRefresh: false, req });

      // then
      expect(result).toBe(expectResult);
    });
  });

  describe('validateToken', () => {
    it.each([
      ['refreshToken', '24h', true],
      ['accessToken', '15m', false],
    ])('검증 통과: %s 일 때', async (env, expiresIn, isRefresh) => {
      // given
      const secret = configService.get(envKeys[`${env}Secret`]);
      const token = jwtService.sign({ sub: 1 }, { secret, expiresIn });
      const req = TestMockData.req();

      // when
      const result = await commonService.validateToken({ token, req, isRefresh });

      // then
      expect(result).toBe(true);
      expect(req.user).toHaveProperty('userId');
    });

    it.each([
      ['refreshToken 일 때', true],
      ['accessToken 일 때', false],
    ])('검증 실패: %s', async (_, isRefresh) => {
      // given
      const req = TestMockData.req();
      const token = 'token';

      // when & then
      await expect(
        commonService.validateToken({ isRefresh, token, req }),
      ).rejects.toThrow(UnauthorizedException);
      expect(req.user).toBeUndefined();
    });
  });
});
