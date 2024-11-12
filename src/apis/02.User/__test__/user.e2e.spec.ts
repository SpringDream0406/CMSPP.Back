import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { AuthService } from 'src/apis/01.Auth/auth.service';
import { mockUpdateMyInfoDto, mockUserId } from 'src/common/__test__/test.mockdata';
import { User } from '../entity/user.entity';
import { Auth } from 'src/apis/01.Auth/entity/auth.entity';
import { mockingAuths, mockingUsers } from 'src/common/__test__/db.mockdata';
import { AppModule } from 'src/app.module';
import { E2eError, E2eUpdate, E2eUser } from 'src/common/__test__/e2e.interface';

console.log(`.env${process.env.NODE_ENV ?? ''}`);

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  let accessToken: string;
  let accessToken2: string;
  let outAccessToken: string;
  let expiredAccessToken: string;

  let users: User[];
  let auths: Auth[];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

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
    accessToken = authService.getAccessToken({ userId: mockUserId });
    accessToken2 = authService.getAccessToken({ userId: 2 });
    outAccessToken = authService.getAccessToken({ userId: 99999 });
    expiredAccessToken = authService.getExpiredAccessToken({ userId: mockUserId });

    const authRepository = dataSource.getRepository(Auth);
    const userReposityory = dataSource.getRepository(User);

    users = mockingUsers([1, 2], userReposityory);
    auths = mockingAuths([1, 2], authRepository, users);

    await userReposityory.save(users);
    await authRepository.save(auths);
  });

  afterAll(async () => {
    await dataSource.synchronize(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    await dataSource.destroy();
    await app.close();
  });

  describe('[GET /user]', () => {
    it('myInfo(User) 데이터 가져오기', async () => {
      const { statusCode, body }: E2eUser = await request(app.getHttpServer())
        .get('/user')
        .set('authorization', `Bearer ${accessToken}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('kWh');
      expect(body).toHaveProperty('recWeight');
      expect(body).toHaveProperty('businessNumber');
      expect(body).toHaveProperty('address');
      expect(body).toHaveProperty('role');
      expect(body).toHaveProperty('createdAt');
    });
  });

  describe('[PUT /user', () => {
    it('User 데이터 업데이트 하기 성공', async () => {
      const { statusCode, body }: E2eUpdate = await request(app.getHttpServer())
        .put('/user')
        .set('authorization', `Bearer ${accessToken}`)
        .send(mockUpdateMyInfoDto);

      expect(statusCode).toBe(200);
      expect(body.affected).toBe(1);
    });

    it('User 데이터 업데이트 하기 실패: 사업자 번호 중복', async () => {
      const { statusCode, body }: E2eError = await request(app.getHttpServer())
        .put('/user')
        .set('authorization', `Bearer ${accessToken2}`)
        .send(mockUpdateMyInfoDto);

      expect(statusCode).toBe(400);
      expect(body.message).toBe('사업자 번호 중복');
    });
  });

  describe('[DELETE /user]', () => {
    it('회원탈퇴 성공', async () => {
      const { statusCode, body }: E2eUpdate = await request(app.getHttpServer())
        .delete('/user')
        .set('authorization', `Bearer ${accessToken}`);

      expect(statusCode).toBe(200);
      expect(body.affected).toBe(1);
    });

    it('회원탈퇴 실패: 탈퇴 실패 DB', async () => {
      const { statusCode, body }: E2eError = await request(app.getHttpServer())
        .delete('/user')
        .set('authorization', `Bearer ${outAccessToken}`);

      expect(statusCode).toBe(400);
      expect(body.message).toBe('탈퇴 실패 DB');
    });
  });

  describe('[DELETE /user - accessToken검증 통합테스트]', () => {
    it('엑세스 토큰 검증 실패: accessToken 만료', async () => {
      const { statusCode } = await request(app.getHttpServer())
        .delete('/user')
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
        .delete('/user')
        .set('authorization', token);

      expect(statusCode).toBe(403);
    });
  });
});
