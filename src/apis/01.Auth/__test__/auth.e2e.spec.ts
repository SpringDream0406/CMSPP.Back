import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { AuthService } from '../auth.service';
import { DynamicAuthGuard, SOCIAL_PROVIDERS } from '../guards/dynamic-auth.guard';
import { DataSource } from 'typeorm';
import { E2eError } from 'src/common/interface/e2e.interface';
import { IBackup, newDb } from 'pg-mem';
import { initPgMem } from 'src/common/config/initPgMem';
import { DBDataFactory, getEntitis } from 'src/common/data/db.mockdata';
import { CustomAuthGuard } from 'src/common/guard/customAuth.guard';

const mockDynamicAuthGuard = {
  canActivate: (context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const { social } = request.params;
    if (!SOCIAL_PROVIDERS.includes(social)) {
      throw new BadRequestException('잘못된 소셜 요청');
    }
    request.user = { id: 'testId', provider: social };
    return true;
  },
};

describe('Auth_e2e', () => {
  let app: INestApplication;

  let refreshToken: string;
  let expiredRefreshToken: string;

  let accessToken: string;

  let customAuthGuard: CustomAuthGuard;

  let dataSource: DataSource;
  let dBDataFactory: DBDataFactory;
  let backup: IBackup;

  beforeAll(async () => {
    const db = newDb();
    const entities = getEntitis();
    dataSource = await initPgMem('Auth_e2e', db, entities);

    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(DynamicAuthGuard)
      .useValue(mockDynamicAuthGuard)
      .overrideProvider(DataSource)
      .useValue(dataSource)
      .overrideProvider(CustomAuthGuard)
      .useClass(customAuthGuard)
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    const userId = 1;
    const authService = module.get(AuthService);
    refreshToken = authService.getToken({ userId, isRefresh: true });
    expiredRefreshToken = authService.getExpiredToken({ userId, isRefresh: true });
    accessToken = authService.getToken({ userId });

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
    await app.close();
  });

  describe('[GET /signup/:social]', () => {
    it.each(SOCIAL_PROVIDERS)('회원가입 성공: %s', async (social) => {
      // when
      const { statusCode, headers } = await request(app.getHttpServer()).get(
        `/signup/${social}`,
      );

      // then
      expect(statusCode).toBe(302);
      expect(headers['set-cookie']).toBeDefined();
      const haveRefreshToken = headers['set-cookie'][0].includes('refreshToken=');
      expect(haveRefreshToken).toBe(true);
    });

    it.each(SOCIAL_PROVIDERS)('로그인: %s', async (social) => {
      // when
      const { statusCode, headers } = await request(app.getHttpServer()).get(
        `/signup/${social}`,
      );

      // then
      expect(statusCode).toBe(302);
      expect(headers['set-cookie']).toBeDefined();
      const haveRefreshToken = headers['set-cookie'][0].includes('refreshToken=');
      expect(haveRefreshToken).toBe(true);
    });

    it('회원가입/로그인 실패: 잘못된 소셜 요청', async () => {
      // when
      const { statusCode, body }: E2eError = await request(app.getHttpServer()).get(
        '/signup/test',
      );

      //then
      expect(statusCode).toBe(400);
      expect(body.message).toBe('잘못된 소셜 요청');
    });

    it('회원 재가입(탈퇴 회원으로 7일 이내 재 로그인)', async () => {
      // given
      dBDataFactory.insertUsersAndAuths([1]);

      // 회원 탈퇴
      await request(app.getHttpServer())
        .delete('/user')
        .set('authorization', `Bearer ${accessToken}`)
        .expect(200);

      // when
      const { statusCode, headers } = await request(app.getHttpServer()).get(
        `/signup/google`,
      );

      // then
      expect(statusCode).toBe(302);
      expect(headers['set-cookie']).toBeDefined();
      const hashRefreshToken = headers['set-cookie'][0].includes('refreshToken=');
      expect(hashRefreshToken).toBe(true);
    });
  });

  describe('[GET /getAccessToken - refreshToken 검증', () => {
    it('엑세스토큰 발급 성공', async () => {
      // when
      const { statusCode, text } = await request(app.getHttpServer())
        .get('/getAccessToken')
        .set('cookie', `refreshToken=${refreshToken}`);

      // then
      expect(statusCode).toBe(200);
      expect(text).toBeDefined();
      expect(text).not.toBe(''); // accessToken 있는지 확인
    });

    it('엑세스토큰 발급 실패: refreshToken 만료', async () => {
      // when
      const { statusCode } = await request(app.getHttpServer())
        .get('/getAccessToken')
        .set('cookie', `refreshToken=${expiredRefreshToken}`);

      // then
      expect(statusCode).toBe(401);
    });

    it.each([
      ['cookie가 비어있는 경우', ''],
      ['refresh 글자가 없는 경우', `=${refreshToken}`],
      ['refresh 대신 다른 글자가 있는 경우', `mock=${refreshToken}`],
      ['refreshToken이 없는 경우', 'refreshToken='],
      ['잘못된 토큰 형식', 'test'],
    ])('엑세스토큰 발급 실패: %s', async (_, token) => {
      //when
      const { statusCode } = await request(app.getHttpServer())
        .get('/getAccessToken')
        .set('cookie', token);

      // then
      expect(statusCode).toBe(403);
    });
  });
});
