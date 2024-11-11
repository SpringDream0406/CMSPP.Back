import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AuthService } from 'src/apis/01.Auth/auth.service';
import { Auth } from 'src/apis/01.Auth/entity/auth.entity';
import { User } from 'src/apis/02.User/entity/user.entity';
import { AppModule } from 'src/app.module';
import { mockingAuths, mockingUsers } from 'src/common/__test__/db.mockdata';
import {
  mockAddExpenseDto,
  mockAddFixedExpenseDto,
  mockAddSolarDto,
  mockAddSRecDto,
  mockDelId,
  mockUserId,
} from 'src/common/__test__/test.mockdata';
import { DataSource } from 'typeorm';
import {
  E2eError,
  E2eExpense,
  E2eFixedExpense,
  E2eIRFetchSpp,
  E2eSolar,
  E2eSRec,
} from 'src/common/__test__/e2e.interface';
import { Solar } from '../entity/solar.entity';
import { SRec } from '../entity/sRec.entity';
import { Expense } from '../entity/expense.entity';
import { FixedExpense } from '../entity/fixedExpense.entity';

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
    accessToken = authService.getAccessToken({ userId: mockUserId });

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

  describe('[GET /spp]', () => {
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

  describe('[POST /spp/solar]', () => {
    it.each([1, 2])('태양광 데이터 추가 성공', async (x) => {
      const dto = { ...mockAddSolarDto, date: `2024-1${x}` };
      const { statusCode, body }: E2eSolar = await request(app.getHttpServer())
        .post('/spp/solar')
        .set('authorization', `Bearer ${accessToken}`)
        .send(dto);

      const solarData = body.find((solar: Solar) => solar.date === dto.date);

      expect(statusCode).toBe(201);
      expect(body).toHaveLength(x);
      expect(solarData.date).toBe(dto.date);
      expect(solarData.generation).toBe(mockAddSolarDto.generation);
      expect(solarData.smp).toBe(mockAddSolarDto.smp.toFixed(2));
      expect(solarData.supplyPrice).toBe(mockAddSolarDto.supplyPrice);
    });

    it('태양광 데이터 추가 실패: 중복', async () => {
      const { statusCode, body }: E2eError = await request(app.getHttpServer())
        .post('/spp/solar')
        .set('authorization', `Bearer ${accessToken}`)
        .send(mockAddSolarDto);

      expect(statusCode).toBe(400);
      expect(body.message).toBe('중복');
    });
  });

  describe('[DELETE /spp/solar/:delId]', () => {
    it('태양광 데이터 삭제', async () => {
      const { statusCode, body }: E2eSolar = await request(app.getHttpServer())
        .delete(`/spp/solar/${mockDelId}`)
        .set('authorization', `Bearer ${accessToken}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveLength(1);
    });
  });

  describe('[POST /spp/sRec]', () => {
    it.each([1, 2])('SRec 데이터 추가', async (x) => {
      const { statusCode, body }: E2eSRec = await request(app.getHttpServer())
        .post('/spp/sRec')
        .set('authorization', `Bearer ${accessToken}`)
        .send(mockAddSRecDto);

      const sRecData = body.find((sRec: SRec) => sRec.date === mockAddSRecDto.date);

      expect(statusCode).toBe(201);
      expect(body).toHaveLength(x);
      expect(sRecData.date).toBe(mockAddSRecDto.date);
      expect(sRecData.sPrice).toBe(mockAddSRecDto.sPrice);
      expect(sRecData.sVolume).toBe(mockAddSRecDto.sVolume);
    });
  });

  describe('[DELETE /spp/sRec/:delId]', () => {
    it('SRec 데이터 삭제', async () => {
      const { statusCode, body }: E2eSolar = await request(app.getHttpServer())
        .delete(`/spp/sRec/${mockDelId}`)
        .set('authorization', `Bearer ${accessToken}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveLength(1);
    });
  });

  describe('[POST /spp/expense]', () => {
    it.each([1, 2])('지출 데이터 추가 ', async (x) => {
      const { statusCode, body }: E2eExpense = await request(app.getHttpServer())
        .post('/spp/expense')
        .set('authorization', `Bearer ${accessToken}`)
        .send(mockAddExpenseDto);

      const expenseData = body.find(
        (expense: Expense) => expense.date === mockAddExpenseDto.date,
      );

      expect(statusCode).toBe(201);
      expect(body).toHaveLength(x);
      expect(expenseData.date).toBe(mockAddExpenseDto.date);
      expect(expenseData.eName).toBe(mockAddExpenseDto.eName);
      expect(expenseData.ePrice).toBe(mockAddExpenseDto.ePrice);
    });
  });

  describe('[DELETE /spp/expense/:delId]', () => {
    it('지출 데이터 삭제', async () => {
      const { statusCode, body }: E2eExpense = await request(app.getHttpServer())
        .delete(`/spp/expense/${mockDelId}`)
        .set('authorization', `Bearer ${accessToken}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveLength(1);
    });
  });

  describe('[POST /spp/fixedExpense]', () => {
    it.each([1, 2])('고정지출 데이터 추가 ', async (x) => {
      const { statusCode, body }: E2eFixedExpense = await request(app.getHttpServer())
        .post('/spp/fixedExpense')
        .set('authorization', `Bearer ${accessToken}`)
        .send(mockAddFixedExpenseDto);

      const fixedExpenseData = body.find(
        (fixedExpense: FixedExpense) =>
          fixedExpense.startDate === mockAddFixedExpenseDto.startDate &&
          fixedExpense.endDate === mockAddFixedExpenseDto.endDate,
      );

      expect(statusCode).toBe(201);
      expect(body).toHaveLength(x);
      expect(fixedExpenseData.startDate).toBe(mockAddFixedExpenseDto.startDate);
      expect(fixedExpenseData.endDate).toBe(mockAddFixedExpenseDto.endDate);
      expect(fixedExpenseData.feName).toBe(mockAddFixedExpenseDto.feName);
      expect(fixedExpenseData.fePrice).toBe(mockAddFixedExpenseDto.fePrice);
    });
  });

  describe('[DELETE /spp/fixedExpense/:delId]', () => {
    it('고정지출 데이터 삭제', async () => {
      const { statusCode, body }: E2eFixedExpense = await request(app.getHttpServer())
        .delete(`/spp/fixedExpense/${mockDelId}`)
        .set('authorization', `Bearer ${accessToken}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveLength(1);
    });
  });
});
