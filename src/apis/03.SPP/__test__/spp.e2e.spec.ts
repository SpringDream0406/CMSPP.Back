import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AuthService } from 'src/apis/01.Auth/auth.service';
import { AppModule } from 'src/app.module';
import { DataSource } from 'typeorm';
import {
  E2eError,
  E2eExpense,
  E2eFixedExpense,
  E2eIRFetchSpp,
  E2eSolar,
  E2eSRec,
} from 'src/common/interface/e2e.interface';
import { TestMockData } from 'src/common/data/test.mockdata';
import { DBDataFactory, getEntitis } from 'src/common/data/db.mockdata';
import { IBackup, newDb } from 'pg-mem';
import { initPgMem } from 'src/common/config/initPgMem';

describe('Spp_e2e', () => {
  let app: INestApplication;

  let accessToken: string;

  let dataSource: DataSource;
  let dBDataFactory: DBDataFactory;
  let backup: IBackup;

  beforeAll(async () => {
    const db = newDb();
    const entities = getEntitis();
    dataSource = await initPgMem('Spp_e2e', db, entities);

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

    const authService = module.get<AuthService>(AuthService);
    accessToken = authService.getToken({ userId: 1 });

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

  describe('[GET /spp]', () => {
    it('Spp 조회하기', async () => {
      // given
      await dBDataFactory.insertDatas([1, 2], true);

      // when
      const { statusCode, body }: E2eIRFetchSpp = await request(app.getHttpServer())
        .get('/spp')
        .set('authorization', `Bearer ${accessToken}`);

      // then
      expect(statusCode).toBe(200);
      expect(body).toHaveProperty('kWh');
      expect(body).toHaveProperty('recWeight');
      expect(body).toHaveProperty('solar');
      expect(body).toHaveProperty('sRec');
      expect(body).toHaveProperty('expense');
      expect(body).toHaveProperty('fixedExpense');
      expect(body.solar).toHaveLength(2);
    });
  });

  describe('[POST /spp/solar]', () => {
    it('태양광 데이터 추가 성공', async () => {
      // given
      await dBDataFactory.insertUsersAndAuths([1]);
      const addSolarDto = TestMockData.addSolarDto({});

      // when
      const { statusCode, body }: E2eSolar = await request(app.getHttpServer())
        .post('/spp/solar')
        .set('authorization', `Bearer ${accessToken}`)
        .send(addSolarDto);

      // then
      const solarData = body[0];

      expect(statusCode).toBe(201);
      expect(body).toHaveLength(1);
      expect(solarData.date).toBe(addSolarDto.date);
      expect(solarData.generation).toBe(addSolarDto.generation);
      expect(solarData.smp).toBe(1);
      expect(solarData.supplyPrice).toBe(addSolarDto.supplyPrice);
    });

    it('태양광 데이터 추가 실패: 중복', async () => {
      // given
      await dBDataFactory.insertDatas([1]);
      const addSolarDto = TestMockData.addSolarDto({
        date: '2024-01',
      });

      // when
      const { statusCode, body }: E2eError = await request(app.getHttpServer())
        .post('/spp/solar')
        .set('authorization', `Bearer ${accessToken}`)
        .send(addSolarDto);

      // then
      expect(statusCode).toBe(400);
      expect(body.message).toBe('중복');
    });
  });

  describe('[DELETE /spp/solar/:delId]', () => {
    it('태양광 데이터 삭제', async () => {
      // given
      await dBDataFactory.insertDatas([1, 2], true);
      const deldId = 1;

      // when
      const { statusCode, body }: E2eSolar = await request(app.getHttpServer())
        .delete(`/spp/solar/${deldId}`)
        .set('authorization', `Bearer ${accessToken}`);

      // then
      expect(statusCode).toBe(200);
      expect(body).toHaveLength(1);
    });
  });

  describe('[POST /spp/sRec]', () => {
    it('SRec 데이터 추가', async () => {
      // given
      await dBDataFactory.insertUsersAndAuths([1]);
      const addSRecDto = TestMockData.addSRecDto({});

      // when
      const { statusCode, body }: E2eSRec = await request(app.getHttpServer())
        .post('/spp/sRec')
        .set('authorization', `Bearer ${accessToken}`)
        .send(addSRecDto);

      // then
      const sRecData = body[0];

      expect(statusCode).toBe(201);
      expect(body).toHaveLength(1);
      expect(sRecData.date).toBe(addSRecDto.date);
      expect(sRecData.sPrice).toBe(addSRecDto.sPrice);
      expect(sRecData.sVolume).toBe(addSRecDto.sVolume);
    });
  });

  describe('[DELETE /spp/sRec/:delId]', () => {
    it('SRec 데이터 삭제', async () => {
      // given
      await dBDataFactory.insertDatas([1, 2], true);
      const mockId = 1;

      // when
      const { statusCode, body }: E2eSolar = await request(app.getHttpServer())
        .delete(`/spp/sRec/${mockId}`)
        .set('authorization', `Bearer ${accessToken}`);

      // then
      expect(statusCode).toBe(200);
      expect(body).toHaveLength(1);
    });
  });

  describe('[POST /spp/expense]', () => {
    it('지출 데이터 추가 ', async () => {
      // given
      await dBDataFactory.insertUsersAndAuths([1]);
      const addExpenseDto = TestMockData.addExpenseDto({});

      // when
      const { statusCode, body }: E2eExpense = await request(app.getHttpServer())
        .post('/spp/expense')
        .set('authorization', `Bearer ${accessToken}`)
        .send(addExpenseDto);

      // then
      const expenseData = body[0];

      expect(statusCode).toBe(201);
      expect(body).toHaveLength(1);
      expect(expenseData.date).toBe(addExpenseDto.date);
      expect(expenseData.eName).toBe(addExpenseDto.eName);
      expect(expenseData.ePrice).toBe(addExpenseDto.ePrice);
    });
  });

  describe('[DELETE /spp/expense/:delId]', () => {
    it('지출 데이터 삭제', async () => {
      // given
      await dBDataFactory.insertDatas([1, 2], true);
      const delId = 1;

      // when
      const { statusCode, body }: E2eExpense = await request(app.getHttpServer())
        .delete(`/spp/expense/${delId}`)
        .set('authorization', `Bearer ${accessToken}`);

      // then
      expect(statusCode).toBe(200);
      expect(body).toHaveLength(1);
    });
  });

  describe('[POST /spp/fixedExpense]', () => {
    it('고정지출 데이터 추가 ', async () => {
      // given
      await dBDataFactory.insertUsersAndAuths([1]);
      const addFixedExpenseDto = TestMockData.addFixedExpenseDto({});

      // when
      const { statusCode, body }: E2eFixedExpense = await request(app.getHttpServer())
        .post('/spp/fixedExpense')
        .set('authorization', `Bearer ${accessToken}`)
        .send(addFixedExpenseDto);

      // then
      const fixedExpenseData = body[0];

      expect(statusCode).toBe(201);
      expect(body).toHaveLength(1);
      expect(fixedExpenseData.startDate).toBe(addFixedExpenseDto.startDate);
      expect(fixedExpenseData.endDate).toBe(addFixedExpenseDto.endDate);
      expect(fixedExpenseData.feName).toBe(addFixedExpenseDto.feName);
      expect(fixedExpenseData.fePrice).toBe(addFixedExpenseDto.fePrice);
    });
  });

  describe('[DELETE /spp/fixedExpense/:delId]', () => {
    it('고정지출 데이터 삭제', async () => {
      // given
      await dBDataFactory.insertDatas([1, 2], true);
      const delId = 1;

      // when
      const { statusCode, body }: E2eFixedExpense = await request(app.getHttpServer())
        .delete(`/spp/fixedExpense/${delId}`)
        .set('authorization', `Bearer ${accessToken}`);

      // then
      expect(statusCode).toBe(200);
      expect(body).toHaveLength(1);
    });
  });
});
