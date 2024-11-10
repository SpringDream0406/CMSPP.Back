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
import { mockUserId } from 'src/common/__test__/unit.mockdata';
import { DynamicAuthGuard, SOCIAL_PROVIDERS } from '../guards/dynamic-auth.guard';
import { DataSource } from 'typeorm';
import { E2eError, E2eUpdate } from 'src/common/__test__/e2e.interface';

const mockDynamicAuthGuard = {
  canActivate: (context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const { social } = request.params;
    if (!SOCIAL_PROVIDERS.includes(social)) {
      throw new BadRequestException('잘못된 소셜 요청');
    }
    request.user = { id: 'mockSocailId', provider: social };
    return true;
  },
};

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  let refreshToken: string;
  let expiredRefreshToken: string;
  let accessToken: string;
  let outAccessToken: string;
  let expiredAccessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(DynamicAuthGuard)
      .useValue(mockDynamicAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    dataSource = app.get<DataSource>(DataSource);

    const authService = moduleFixture.get<AuthService>(AuthService);
    refreshToken = authService.getRefreshToken({ userId: mockUserId });
    expiredRefreshToken = authService.getExpiredRefreshToken({ userId: mockUserId });
    accessToken = authService.getAccessToken({ userId: mockUserId });
    outAccessToken = authService.getAccessToken({ userId: 99999 });
    expiredAccessToken = authService.getExpiredAccessToken({ userId: mockUserId });
  });

  afterAll(async () => {
    await dataSource.synchronize(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await dataSource.destroy();
    await app.close();
  });

  describe('[GET /signup/:social]', () => {
    it.each(SOCIAL_PROVIDERS)('회원가입 성공: %s', async (social) => {
      const { statusCode, headers } = await request(app.getHttpServer()).get(
        `/signup/${social}`,
      );

      expect(statusCode).toBe(302);
      expect(headers['set-cookie']).toBeDefined();
      const hashRefreshToken = headers['set-cookie'][0].includes('refreshToken=');
      expect(hashRefreshToken).toBe(true);
    });

    it.each(SOCIAL_PROVIDERS)('로그인: %s', async (social) => {
      const { statusCode, headers } = await request(app.getHttpServer()).get(
        `/signup/${social}`,
      );

      expect(statusCode).toBe(302);
      expect(headers['set-cookie']).toBeDefined();
      const hashRefreshToken = headers['set-cookie'][0].includes('refreshToken=');
      expect(hashRefreshToken).toBe(true);
    });

    it('회원가입/로그인 실패: 잘못된 소셜 요청', async () => {
      const { statusCode, body }: E2eError = await request(app.getHttpServer()).get(
        '/signup/test',
      );

      expect(statusCode).toBe(400);
      expect(body.message).toBe('잘못된 소셜 요청');
    });
  });

  describe('[DELETE /withdrawal]', () => {
    it('회원탈퇴 성공', async () => {
      const { statusCode, body }: E2eUpdate = await request(app.getHttpServer())
        .delete('/withdrawal')
        .set('authorization', `Bearer ${accessToken}`);

      expect(statusCode).toBe(200);
      expect(body.affected).toBe(1);
    });

    it('회원탈퇴 실패: 탈퇴 실패 DB', async () => {
      const { statusCode, body }: E2eError = await request(app.getHttpServer())
        .delete('/withdrawal')
        .set('authorization', `Bearer ${outAccessToken}`);

      expect(statusCode).toBe(400);
      expect(body.message).toBe('탈퇴 실패 DB');
    });
  });

  describe('[GET /getAccessToken - refreshToken 검증', () => {
    it('엑세스토큰 발급 성공', async () => {
      const { statusCode, text } = await request(app.getHttpServer())
        .get('/getAccessToken')
        .set('cookie', `refreshToken=${refreshToken}`);

      expect(statusCode).toBe(200);
      expect(text).toBeDefined();
      expect(text).not.toBe(''); // accessToken 있는지 확인
    });

    it('엑세스토큰 발급 실패: refreshToken 만료', async () => {
      const { statusCode } = await request(app.getHttpServer())
        .get('/getAccessToken')
        .set('cookie', `refreshToken=${expiredRefreshToken}`);

      expect(statusCode).toBe(401);
    });

    it.each([
      ['cookie가 비어있는 경우', ''],
      ['refresh 글자가 없는 경우', `=${refreshToken}`],
      ['refresh 대신 다른 글자가 있는 경우', `mock=${refreshToken}`],
      ['refreshToken이 없는 경우', 'refreshToken='],
      ['잘못된 토큰 형식', 'test'],
    ])('엑세스토큰 발급 실패: %s', async (_, token) => {
      const { statusCode } = await request(app.getHttpServer())
        .get('/getAccessToken')
        .set('cookie', token);

      expect(statusCode).toBe(403);
    });
  });

  describe('[DELETE /withdrawal - accessToken검증 통합테스트]', () => {
    it('엑세스 토큰 검증 실패: accessToken 만료', async () => {
      const { statusCode } = await request(app.getHttpServer())
        .delete('/withdrawal')
        .set('authorization', `Bearer ${expiredAccessToken}`);

      expect(statusCode).toBe(401);
    });

    it.each([
      ['authorization가 비어있는 경우', ''],
      ['Bearer 글자가 없는 경우', ` ${accessToken}`],
      ['Bearer 대신 다른 글자가 있는 경우', `mock ${accessToken}`],
      ['accessToken이 없는 경우', `Bearer `],
      ['잘못된 토큰 형식', 'test'],
    ])('엑세스 토큰 검증 실패: %s', async (_, token) => {
      const { statusCode } = await request(app.getHttpServer())
        .delete('/withdrawal')
        .set('authorization', token);

      expect(statusCode).toBe(403);
    });
  });
});
