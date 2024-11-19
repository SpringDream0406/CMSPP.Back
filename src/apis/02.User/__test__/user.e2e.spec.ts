import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { AuthService } from 'src/apis/01.Auth/auth.service';
import { AppModule } from 'src/app.module';
import { E2eError, E2eUpdate, E2eUser } from 'src/common/interface/e2e.interface';
import { TestMockData } from 'src/common/data/test.mockdata';
import { DBDataFactory, getEntitis } from 'src/common/data/db.mockdata';
import { IBackup, newDb } from 'pg-mem';
import { initPgMem } from 'src/common/config/initPgMem';

describe('User_e2e', () => {
  let app: INestApplication;

  let accessToken: string;
  let outAccessToken: string;
  let expiredAccessToken: string;

  let dataSource: DataSource;
  let dBDataFactory: DBDataFactory;
  let backup: IBackup;

  beforeAll(async () => {
    const db = newDb();
    const entities = getEntitis();
    dataSource = await initPgMem('User_e2e', db, entities);

    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DataSource)
      .useValue(dataSource)
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    const authService = module.get(AuthService);
    accessToken = authService.getToken({ userId: 1 });
    outAccessToken = authService.getToken({ userId: 99999 });
    expiredAccessToken = authService.getExpiredToken({ userId: 1 });

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

  describe('[GET /user]', () => {
    it('myInfo(User) 데이터 가져오기', async () => {
      // given
      await dBDataFactory.insertDatas([1, 2]);

      // when
      const { statusCode, body }: E2eUser = await request(app.getHttpServer())
        .get('/user')
        .set('authorization', `Bearer ${accessToken}`);

      // then
      expect(statusCode).toBe(200);
      expect(Object.keys(body)).toHaveLength(8);
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('kWh');
      expect(body).toHaveProperty('recWeight');
      expect(body).toHaveProperty('businessNumber');
      expect(body).toHaveProperty('address');
      expect(body).toHaveProperty('role');
      expect(body).toHaveProperty('createdAt');
      expect(body).toHaveProperty('deletedAt');
    });
  });

  describe('[PUT /user', () => {
    it('User 데이터 업데이트 하기 성공', async () => {
      // given
      await dBDataFactory.insertDatas([1, 2]);
      const mockUpdateMyInfoDto = TestMockData.updateMyInfoDto({});

      // when
      const { statusCode, body }: E2eUpdate = await request(app.getHttpServer())
        .put('/user')
        .set('authorization', `Bearer ${accessToken}`)
        .send(mockUpdateMyInfoDto);

      // then
      expect(statusCode).toBe(200);
      expect(body.affected).toBe(1);
    });

    it('User 데이터 업데이트 하기 실패: 사업자 번호 중복', async () => {
      // given
      await dBDataFactory.insertDatas([1, 2]);
      const mockUpdateMyInfoDto = TestMockData.updateMyInfoDto({
        businessNumber: 123456782 as unknown as string,
      });

      // when
      const { statusCode, body }: E2eError = await request(app.getHttpServer())
        .put('/user')
        .set('authorization', `Bearer ${accessToken}`)
        .send(mockUpdateMyInfoDto);

      // then
      expect(statusCode).toBe(400);
      expect(body.message).toBe('사업자 번호 중복');
    });
  });

  describe('[DELETE /user]', () => {
    it('회원탈퇴 성공', async () => {
      // given
      await dBDataFactory.insertDatas([1, 2]);

      // when
      const { statusCode, body }: E2eUpdate = await request(app.getHttpServer())
        .delete('/user')
        .set('authorization', `Bearer ${accessToken}`);

      // then
      expect(statusCode).toBe(200);
      expect(body.affected).toBe(1);
    });

    it('회원탈퇴 실패: 탈퇴 실패 DB', async () => {
      // given
      await dBDataFactory.insertDatas([1, 2]);

      // when
      const { statusCode, body }: E2eError = await request(app.getHttpServer())
        .delete('/user')
        .set('authorization', `Bearer ${outAccessToken}`);

      // then
      expect(statusCode).toBe(400);
      expect(body.message).toBe('탈퇴 실패 DB');
    });
  });

  describe('[DELETE /user - accessToken검증 통합테스트]', () => {
    it('엑세스 토큰 검증 실패: accessToken 만료', async () => {
      // when
      const { statusCode } = await request(app.getHttpServer())
        .delete('/user')
        .set('authorization', `Bearer ${expiredAccessToken}`);

      // then
      expect(statusCode).toBe(401);
    });

    it.each([
      ['authorization가 비어있는 경우', ''],
      ['Bearer 글자가 없는 경우', ` ${accessToken}`],
      ['Bearer 대신 다른 글자가 있는 경우', `mock ${accessToken}`],
      ['accessToken이 없는 경우', `Bearer `],
      ['잘못된 토큰 형식', 'test'],
    ])('엑세스 토큰 검증 실패: %s', async (_, token) => {
      // when
      const { statusCode } = await request(app.getHttpServer())
        .delete('/user')
        .set('authorization', token);

      // then
      expect(statusCode).toBe(403);
    });
  });
});
