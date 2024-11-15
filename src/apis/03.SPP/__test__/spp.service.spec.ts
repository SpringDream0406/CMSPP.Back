import { TestBed } from '@automock/jest';
import { SppService } from '../spp.service';
import { UserService } from 'src/apis/02.User/user.service';
import { BadRequestException } from '@nestjs/common';
import { TestMockData } from 'src/common/data/test.mockdata';

describe('SppService', () => {
  let sppService: SppService;
  let userService: jest.Mocked<UserService>;

  beforeEach(() => {
    const { unit, unitRef } = TestBed.create(SppService).compile();

    sppService = unit;
    userService = unitRef.get(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(sppService).toBeDefined();
  });

  // --
  describe('fetchSpp', () => {
    // --
    it('Spp 조회하기', async () => {
      const user = TestMockData.user({});
      delete user.id; // 실제 로직에 삭제하는게 있어 똑같이 맞춤
      const userId = 1;

      jest.spyOn(userService, 'findOneByUserIdForSpp').mockResolvedValue(user);

      const reuslt = await sppService.fetchSpp({ userId });

      expect(reuslt).toEqual(user);
    });
  });

  // --
  describe('addSolar', () => {
    const addSolarDto = TestMockData.addSolarDto({}); // dto 같음
    const userId = 1; // userId 같음

    // --
    it('태양광 데이터 추가 성공', async () => {
      const solar = TestMockData.solar({});

      jest.spyOn(sppService, 'existsByUserIdFromSolar').mockResolvedValue(false);
      jest.spyOn(sppService, 'findByUserIdFromSolar').mockResolvedValue([solar]);

      const result = await sppService.addSolar({
        userId,
        addSolarDto,
      });

      expect(result).toEqual([solar]);
    });

    // --
    it('태양광 데이터 추가 실패: 월 데이터 중복', async () => {
      jest.spyOn(sppService, 'existsByUserIdFromSolar').mockResolvedValue(true);
      jest.spyOn(sppService, 'saveSolar');

      await expect(sppService.addSolar({ userId, addSolarDto })).rejects.toThrow(
        BadRequestException,
      );
      expect(sppService.saveSolar).not.toHaveBeenCalled();
    });
  });

  // --
  describe('deleteSolar', () => {
    // --
    it('태양광 데이터 삭제', async () => {
      const solar = TestMockData.solar({});
      const userId = 1;
      const delId = 1;

      jest.spyOn(sppService, 'findByUserIdFromSolar').mockResolvedValue([solar]);

      const result = await sppService.deleteSolar({
        userId,
        delId,
      });

      expect(result).toEqual([solar]);
    });
  });

  // --
  describe('addSRec', () => {
    // --
    it('SRec 데이터 추가', async () => {
      const sRec = TestMockData.sRec({});
      const userId = 1;
      const addSRecDto = TestMockData.addSRecDto({});

      jest.spyOn(sppService, 'findByUserIdFromSRec').mockResolvedValue([sRec]);

      const result = await sppService.addSRec({
        userId,
        addSRecDto,
      });

      expect(result).toEqual([sRec]);
    });
  });

  // --
  describe('deleteSRec', () => {
    // --
    it('SRec 데이터 삭제', async () => {
      const sRec = TestMockData.sRec({});
      const userId = 1;
      const delId = 1;

      jest.spyOn(sppService, 'findByUserIdFromSRec').mockResolvedValue([sRec]);

      const result = await sppService.deleteSRec({
        userId,
        delId,
      });

      expect(result).toEqual([sRec]);
    });
  });

  // --
  describe('addExpense', () => {
    // --
    it('지출 데이터 추가', async () => {
      const expense = TestMockData.expense({});
      const userId = 1;
      const addExpenseDto = TestMockData.addExpenseDto({});

      jest.spyOn(sppService, 'findByUserIdFromExpense').mockResolvedValue([expense]);

      const result = await sppService.addExpense({
        userId,
        addExpenseDto,
      });

      expect(result).toEqual([expense]);
    });
  });

  // --
  describe('deleteExpense', () => {
    // --
    it('지출 데이터 삭제', async () => {
      const expense = TestMockData.expense({});
      const userId = 1;
      const delId = 1;

      jest.spyOn(sppService, 'findByUserIdFromExpense').mockResolvedValue([expense]);

      const result = await sppService.deleteExpense({
        userId,
        delId,
      });

      expect(result).toEqual([expense]);
    });
  });

  // --
  describe('addFixedExpense', () => {
    // --
    it('고정지출 데이터 추가 성공', async () => {
      const fixedExpense = TestMockData.fixedExpense({});
      const userId = 1;
      const addFixedExpenseDto = TestMockData.addFixedExpenseDto({});

      jest
        .spyOn(sppService, 'findByUserIdFromFixedExpense')
        .mockResolvedValue([fixedExpense]);

      const result = await sppService.addFixedExpense({
        userId,
        addFixedExpenseDto,
      });

      expect(result).toEqual([fixedExpense]);
    });

    // --
    it('고정 지출 데이터 추가 실패: 시작날짜 > 종료날짜', async () => {
      const userId = 1;
      const addFixedExpenseDto = TestMockData.addFixedExpenseDto({
        startDate: '2024-11',
        endDate: '2023-1',
      });

      jest.spyOn(sppService, 'saveFixedExpense');

      await expect(
        sppService.addFixedExpense({
          userId,
          addFixedExpenseDto,
        }),
      ).rejects.toThrow(BadRequestException);
      expect(sppService.saveFixedExpense).not.toHaveBeenCalled();
    });
  });

  // --
  describe('deleteFixedExpense', () => {
    // --
    it('고정 지출 데이터 삭제', async () => {
      const fixedExpense = TestMockData.fixedExpense({});
      const userId = 1;
      const delId = 1;

      jest
        .spyOn(sppService, 'findByUserIdFromFixedExpense')
        .mockResolvedValue([fixedExpense]);

      const result = await sppService.deleteFixedExpense({
        userId,
        delId,
      });

      expect(result).toEqual([fixedExpense]);
    });
  });
});
