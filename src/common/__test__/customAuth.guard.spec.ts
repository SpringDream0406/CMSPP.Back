import { CustomAuthGuard } from '../guard/customAuth.guard';
import { CommonService } from '../common.service';
import { TestMockData } from '../data/test.mockdata';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envKeys, validationSchema } from '../config/validation.schema';
import { UnauthorizedException } from '@nestjs/common';

describe('CustomAuthGuard', () => {
  let customAuthGuard: CustomAuthGuard;

  let commonService: CommonService;
  let configService: ConfigService;
  let jwtService: JwtService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          validationSchema: validationSchema,
          envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
        }),
      ],
      providers: [
        CustomAuthGuard, //
        CommonService,
        ConfigService,
        JwtService,
      ],
    }).compile();

    customAuthGuard = module.get(CustomAuthGuard);

    commonService = module.get(CommonService);
    configService = module.get(ConfigService);
    jwtService = module.get(JwtService);
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

    /** 테스트용 헤더에 들어가는 인증 만들기 */
    class makeToken {
      static cookie(expiresIn = '24h') {
        if (expiresIn === 'w') {
          return `refreshToken=token`;
        }
        const secret = configService.get<string>(envKeys.refreshTokenSecret);
        const token = jwtService.sign({ sub: 1 }, { secret, expiresIn });
        return `refreshToken=${token}`;
      }
      static authorization(expiresIn = '15m') {
        if (expiresIn === 'w') {
          return `Bearer token`;
        }
        const secret = configService.get<string>(envKeys.accessTokenSecret);
        const token = jwtService.sign({ sub: 1 }, { secret, expiresIn });
        return `Bearer ${token}`;
      }
    }

    it.each([
      ['cookie', 'refresh'],
      ['authorization', undefined],
    ])('통과 %s', async (header, isPublic) => {
      // given
      const req = TestMockData.req();
      req.headers[header] = makeToken[header]();
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
      const req = TestMockData.req();
      const expired = message === 'expired';
      req.headers[header] = expired ? makeToken[header](-1) : makeToken[header]('w');
      const context = TestMockData.executionContext(req);

      jest.spyOn(commonService, 'getMetaData').mockReturnValue(isPublic);

      // when & then
      await expect(customAuthGuard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
