import { SppService } from '../spp.service';
import { UserService } from 'src/apis/02.User/user.service';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DBDataFactory, getEntitis } from 'src/common/data/db.mockdata';
import { IBackup, newDb } from 'pg-mem';
import { initPgMem } from 'src/common/config/initPgMem';
import { TestMockData } from 'src/common/data/test.mockdata';

describe('SppService_Integration', () => {
  let sppService: SppService;

  let dataSource: DataSource;
  let dBDataFactory: DBDataFactory;
  let backup: IBackup;

  beforeAll(async () => {
    const db = newDb();
    const entities = getEntitis();
    dataSource = await initPgMem('SppService_Integration', db, entities);

    const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(), TypeOrmModule.forFeature(entities)],
      providers: [SppService, UserService],
    })
      .overrideProvider(DataSource)
      .useValue(dataSource)
      .compile();

    sppService = module.get(SppService);

    const entityManager = dataSource.createEntityManager();
    dBDataFactory = new DBDataFactory(entityManager);

    backup = db.backup();
  });

  afterEach(() => {
    backup.restore();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('should be defined', () => {
    expect(sppService).toBeDefined();
  });

  describe('fetchSpp', () => {
    it('Spp 조회하기', async () => {
      // given
      await dBDataFactory.insertDatas([1]);
      const userId = 1;

      // when
      const result = await sppService.fetchSpp({ userId });

      // then
      expect(result).not.toHaveProperty('id');
      expect(result).toHaveProperty('kWh');
      expect(result).toHaveProperty('recWeight');
      expect(result).toHaveProperty('solar');
      expect(result).toHaveProperty('sRec');
      expect(result).toHaveProperty('expense');
      expect(result).toHaveProperty('fixedExpense');
    });
  });

  describe('addSolar', () => {
    it('태양광 데이터 추가 성공', async () => {
      // given
      await dBDataFactory.insertUsersAndAuths([1]);
      const userId = 1;
      const addSolarDto = TestMockData.addSolarDto({});

      // when
      const result = await sppService.addSolar({
        userId,
        addSolarDto,
      });

      // then
      const solar = result[0];

      expect(solar.id).toBe(userId);
      expect(solar.date).toBe(addSolarDto.date);
      expect(solar.generation).toBe(addSolarDto.generation);
      expect(solar.smp).toBe(addSolarDto.smp);
      expect(solar.supplyPrice).toBe(addSolarDto.supplyPrice);
    });

    it('태양광 데이터 추가 실패: 월 데이터 중복', async () => {
      // given
      await dBDataFactory.insertDatas([1]);
      const userId = 1;
      const addSolarDto = TestMockData.addSolarDto({ date: '2024-01' });

      jest.spyOn(sppService, 'saveSolar');

      // when & then
      await expect(sppService.addSolar({ userId, addSolarDto })).rejects.toThrow(
        BadRequestException,
      );
      expect(sppService.saveSolar).not.toHaveBeenCalled();
    });
  });

  describe('deleteSolar', () => {
    it('태양광 데이터 삭제', async () => {
      // given
      await dBDataFactory.insertDatas([1, 2], true);

      const userId = 1;
      const delId = 1;

      // when
      const result = await sppService.deleteSolar({
        userId,
        delId,
      });

      // then
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('smp');
    });
  });

  describe('addSRec', () => {
    it('SRec 데이터 추가', async () => {
      // given
      await dBDataFactory.insertUsersAndAuths([1]);
      const userId = 1;
      const addSRecDto = TestMockData.addSRecDto({});

      // when
      const result = await sppService.addSRec({
        userId,
        addSRecDto,
      });

      // then
      const sRec = result[0];

      expect(sRec.id).toBe(userId);
      expect(sRec.date).toBe(addSRecDto.date);
      expect(sRec.sPrice).toBe(addSRecDto.sPrice);
      expect(sRec.sVolume).toBe(addSRecDto.sVolume);
    });
  });

  describe('deleteSRec', () => {
    it('SRec 데이터 삭제', async () => {
      // given
      await dBDataFactory.insertDatas([1, 2], true);
      const userId = 1;
      const delId = 1;

      // when
      const result = await sppService.deleteSRec({
        userId,
        delId,
      });

      // then
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('sPrice');
    });
  });

  describe('addExpense', () => {
    it('지출 데이터 추가', async () => {
      // given
      await dBDataFactory.insertUsersAndAuths([1]);
      const userId = 1;
      const addExpenseDto = TestMockData.addExpenseDto({});

      // when
      const result = await sppService.addExpense({
        userId,
        addExpenseDto,
      });

      // then
      const expense = result[0];
      expect(expense.id).toBe(userId);
      expect(expense.date).toBe(addExpenseDto.date);
      expect(expense.eName).toBe(addExpenseDto.eName);
      expect(expense.ePrice).toBe(addExpenseDto.ePrice);
    });
  });

  describe('deleteExpense', () => {
    it('지출 데이터 삭제', async () => {
      // given
      await dBDataFactory.insertDatas([1, 2], true);
      const userId = 1;
      const delId = 1;

      // when
      const result = await sppService.deleteExpense({
        userId,
        delId,
      });

      // then
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('eName');
    });
  });

  describe('addFixedExpense', () => {
    it('고정지출 데이터 추가 성공', async () => {
      // given
      await dBDataFactory.insertDatas([1, 2], true);
      const userId = 1;
      const addFixedExpenseDto = TestMockData.addFixedExpenseDto({});

      // when
      const result = await sppService.addFixedExpense({
        userId,
        addFixedExpenseDto,
      });

      // then
      const fixedExpense = result[0];
      expect(fixedExpense.id).toBe(userId);
      expect(fixedExpense.feName).toBe(addFixedExpenseDto.feName);
      expect(fixedExpense.fePrice).toBe(addFixedExpenseDto.fePrice);
      expect(fixedExpense.startDate).toBe(addFixedExpenseDto.startDate);
      expect(fixedExpense.endDate).toBe(addFixedExpenseDto.endDate);
    });

    it('고정 지출 데이터 추가 실패: 시작날짜 > 종료날짜', async () => {
      // given
      const userId = 1;
      const addFixedExpenseDto = TestMockData.addFixedExpenseDto({
        startDate: '2024-11',
        endDate: '2023-1',
      });

      jest.spyOn(sppService, 'saveFixedExpense');

      // when & then
      await expect(
        sppService.addFixedExpense({
          userId,
          addFixedExpenseDto,
        }),
      ).rejects.toThrow(BadRequestException);
      expect(sppService.saveFixedExpense).not.toHaveBeenCalled();
    });
  });

  describe('deleteFixedExpense', () => {
    it('고정 지출 데이터 삭제', async () => {
      // given
      await dBDataFactory.insertDatas([1, 2], true);
      const userId = 1;
      const delId = 1;

      // when
      const result = await sppService.deleteFixedExpense({
        userId,
        delId,
      });

      // then
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('feName');
    });
  });
});
