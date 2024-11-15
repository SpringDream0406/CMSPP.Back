import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AuthService } from 'src/apis/01.Auth/auth.service';
import { Auth } from 'src/apis/01.Auth/entity/auth.entity';
import { User } from 'src/apis/02.User/entity/user.entity';
import { AppModule } from 'src/app.module';
import { DBMockData } from 'src/common/data/db.mockdata';
import { DataSource } from 'typeorm';
import {
  E2eError,
  E2eExpense,
  E2eFixedExpense,
  E2eIRFetchSpp,
  E2eSolar,
  E2eSRec,
} from 'src/common/interface/e2e.interface';
import { Solar } from '../entity/solar.entity';
import { SRec } from '../entity/sRec.entity';
import { Expense } from '../entity/expense.entity';
import { FixedExpense } from '../entity/fixedExpense.entity';
import { TestMockData } from 'src/common/data/test.mockdata';

console.log(`.env${process.env.NODE_ENV ?? ''}`);

describe('SppController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  let accessToken: string;

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
    accessToken = authService.getAccessToken({ userId: 1 });

    const authRepository = dataSource.getRepository(Auth);
    const userReposityory = dataSource.getRepository(User);

    users = DBMockData.users([1, 2], userReposityory);
    auths = DBMockData.auths([1, 2], authRepository, users);

    await userReposityory.save(users);
    await authRepository.save(auths);
  });

  afterAll(async () => {
    await dataSource.synchronize(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    await dataSource.destroy();
    await app.close();
  });

  // --
  describe('[GET /spp]', () => {
    // --
    it('Spp 조회하기', async () => {
      const { statusCode, body }: E2eIRFetchSpp = await request(app.getHttpServer())
        .get('/spp')
        .set('authorization', `Bearer ${accessToken}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty('kWh');
      expect(body).toHaveProperty('recWeight');
      expect(body).toHaveProperty('solar');
      expect(body).toHaveProperty('sRec');
      expect(body).toHaveProperty('expense');
      expect(body).toHaveProperty('fixedExpense');
    });
  });

  // --
  describe('[POST /spp/solar]', () => {
    // --
    it.each([1, 2])('태양광 데이터 추가 성공', async (x) => {
      const addSolarDto = TestMockData.addSolarDto({
        date: `2024-1${x}`,
      });

      const { statusCode, body }: E2eSolar = await request(app.getHttpServer())
        .post('/spp/solar')
        .set('authorization', `Bearer ${accessToken}`)
        .send(addSolarDto);

      const solarData = body.find((solar: Solar) => solar.date === addSolarDto.date);

      expect(statusCode).toBe(201);
      expect(body).toHaveLength(x);
      expect(solarData.date).toBe(addSolarDto.date);
      expect(solarData.generation).toBe(addSolarDto.generation);
      expect(solarData.smp).toBe(addSolarDto.smp.toFixed(2));
      expect(solarData.supplyPrice).toBe(addSolarDto.supplyPrice);
    });

    // --
    it('태양광 데이터 추가 실패: 중복', async () => {
      const addSolarDto = TestMockData.addSolarDto({});

      const { statusCode, body }: E2eError = await request(app.getHttpServer())
        .post('/spp/solar')
        .set('authorization', `Bearer ${accessToken}`)
        .send(addSolarDto);

      expect(statusCode).toBe(400);
      expect(body.message).toBe('중복');
    });
  });

  // --
  describe('[DELETE /spp/solar/:delId]', () => {
    // --
    it('태양광 데이터 삭제', async () => {
      const deldId = 1;

      const { statusCode, body }: E2eSolar = await request(app.getHttpServer())
        .delete(`/spp/solar/${deldId}`)
        .set('authorization', `Bearer ${accessToken}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveLength(1);
    });
  });

  // --
  describe('[POST /spp/sRec]', () => {
    // --
    it.each([1, 2])('SRec 데이터 추가', async (x) => {
      const addSRecDto = TestMockData.addSRecDto({});

      const { statusCode, body }: E2eSRec = await request(app.getHttpServer())
        .post('/spp/sRec')
        .set('authorization', `Bearer ${accessToken}`)
        .send(addSRecDto);

      const sRecData = body.find(
        (sRec: SRec) =>
          sRec.date === addSRecDto.date && sRec.sPrice === addSRecDto.sPrice,
      );

      expect(statusCode).toBe(201);
      expect(body).toHaveLength(x);
      expect(sRecData.date).toBe(addSRecDto.date);
      expect(sRecData.sPrice).toBe(addSRecDto.sPrice);
      expect(sRecData.sVolume).toBe(addSRecDto.sVolume);
    });
  });

  // --
  describe('[DELETE /spp/sRec/:delId]', () => {
    // --
    it('SRec 데이터 삭제', async () => {
      const mockId = 1;

      const { statusCode, body }: E2eSolar = await request(app.getHttpServer())
        .delete(`/spp/sRec/${mockId}`)
        .set('authorization', `Bearer ${accessToken}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveLength(1);
    });
  });

  // --
  describe('[POST /spp/expense]', () => {
    // --
    it.each([1, 2])('지출 데이터 추가 ', async (x) => {
      const addExpenseDto = TestMockData.addExpenseDto({});

      const { statusCode, body }: E2eExpense = await request(app.getHttpServer())
        .post('/spp/expense')
        .set('authorization', `Bearer ${accessToken}`)
        .send(addExpenseDto);

      const expenseData = body.find(
        (expense: Expense) =>
          expense.date === addExpenseDto.date && expense.eName === addExpenseDto.eName,
      );

      expect(statusCode).toBe(201);
      expect(body).toHaveLength(x);
      expect(expenseData.date).toBe(addExpenseDto.date);
      expect(expenseData.eName).toBe(addExpenseDto.eName);
      expect(expenseData.ePrice).toBe(addExpenseDto.ePrice);
    });
  });

  // --
  describe('[DELETE /spp/expense/:delId]', () => {
    // --
    it('지출 데이터 삭제', async () => {
      const delId = 1;

      const { statusCode, body }: E2eExpense = await request(app.getHttpServer())
        .delete(`/spp/expense/${delId}`)
        .set('authorization', `Bearer ${accessToken}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveLength(1);
    });
  });

  // --
  describe('[POST /spp/fixedExpense]', () => {
    // --
    it.each([1, 2])('고정지출 데이터 추가 ', async (x) => {
      const addFixedExpenseDto = TestMockData.addFixedExpenseDto({});

      const { statusCode, body }: E2eFixedExpense = await request(app.getHttpServer())
        .post('/spp/fixedExpense')
        .set('authorization', `Bearer ${accessToken}`)
        .send(addFixedExpenseDto);

      const fixedExpenseData = body.find(
        (fixedExpense: FixedExpense) =>
          fixedExpense.startDate === addFixedExpenseDto.startDate &&
          fixedExpense.endDate === addFixedExpenseDto.endDate &&
          fixedExpense.feName === addFixedExpenseDto.feName,
      );

      expect(statusCode).toBe(201);
      expect(body).toHaveLength(x);
      expect(fixedExpenseData.startDate).toBe(addFixedExpenseDto.startDate);
      expect(fixedExpenseData.endDate).toBe(addFixedExpenseDto.endDate);
      expect(fixedExpenseData.feName).toBe(addFixedExpenseDto.feName);
      expect(fixedExpenseData.fePrice).toBe(addFixedExpenseDto.fePrice);
    });
  });

  // --
  describe('[DELETE /spp/fixedExpense/:delId]', () => {
    // --
    it('고정지출 데이터 삭제', async () => {
      const delId = 1;

      const { statusCode, body }: E2eFixedExpense = await request(app.getHttpServer())
        .delete(`/spp/fixedExpense/${delId}`)
        .set('authorization', `Bearer ${accessToken}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveLength(1);
    });
  });
});
