import { TestBed } from '@automock/jest';
import { SppController } from '../spp.controller';
import { SppService } from '../spp.service';
import { TestMockData } from 'src/common/data/test.mockdata';

describe('SppController', () => {
  let sppController: SppController;
  let sppService: jest.Mocked<SppService>;

  beforeAll(() => {
    const { unit, unitRef } = TestBed.create(SppController).compile();

    sppController = unit;
    sppService = unitRef.get<SppService>(SppService);
  });

  it('should be defined', () => {
    expect(SppController).toBeDefined();
  });

  describe('fetchSpp', () => {
    it('Spp 조회하기', async () => {
      // given
      const user = TestMockData.user({});
      const userId = 1;

      jest.spyOn(sppService, 'fetchSpp').mockResolvedValue(user);

      // when
      const result = await sppController.fetchSpp(userId);

      // then
      expect(result).toBe(user);
      expect(sppService.fetchSpp).toHaveBeenCalledWith({ userId });
    });
  });

  describe('addSolar', () => {
    it('태양광 데이터 추가', async () => {
      // given
      const solar = TestMockData.solar({});
      const userId = 1;
      const addSolarDto = TestMockData.addSolarDto({});

      jest.spyOn(sppService, 'addSolar').mockResolvedValue([solar]);

      // when
      const result = await sppController.addSolar(userId, addSolarDto);

      // then
      expect(result).toEqual([solar]);
      expect(sppService.addSolar).toHaveBeenCalledWith({
        userId,
        addSolarDto,
      });
    });
  });

  describe('deleteSolar', () => {
    it('태양광 데이터 삭제', async () => {
      // given
      const solar = TestMockData.solar({});
      const userId = 1;
      const delId = 1;

      jest.spyOn(sppService, 'deleteSolar').mockResolvedValue([solar]);

      // when
      const result = await sppController.deleteSolar(userId, delId);

      // then
      expect(result).toEqual([solar]);
      expect(sppService.deleteSolar).toHaveBeenCalledWith({
        userId,
        delId,
      });
    });
  });

  describe('addSRec', () => {
    it('SRec 데이터 추가', async () => {
      // given
      const sRec = TestMockData.sRec({});
      const userId = 1;
      const addSRecDto = TestMockData.addSRecDto({});

      jest.spyOn(sppService, 'addSRec').mockResolvedValue([sRec]);

      // when
      const result = await sppController.addSRec(userId, addSRecDto);

      // then
      expect(result).toEqual([sRec]);
      expect(sppService.addSRec).toHaveBeenLastCalledWith({
        userId,
        addSRecDto,
      });
    });
  });

  describe('deleteSRec', () => {
    it('SRec 데이터 삭제', async () => {
      // given
      const sRec = TestMockData.sRec({});
      const userId = 1;
      const delId = 1;

      jest.spyOn(sppService, 'deleteSRec').mockResolvedValue([sRec]);

      // when
      const result = await sppController.deleteSRec(userId, delId);

      // then
      expect(result).toEqual([sRec]);
      expect(sppService.deleteSRec).toHaveBeenCalledWith({
        userId,
        delId,
      });
    });

    // --
    describe('addExpense', () => {
      // --
      it('지출 데이터 추가', async () => {
        const expense = TestMockData.expense({});
        const userId = 1;
        const addExpenseDto = TestMockData.addExpenseDto({});

        jest.spyOn(sppService, 'addExpense').mockResolvedValue([expense]);

        const result = await sppController.addExpense(userId, addExpenseDto);

        expect(result).toEqual([expense]);
        expect(sppService.addExpense).toHaveBeenCalledWith({
          userId,
          addExpenseDto,
        });
      });
    });
  });

  // --
  describe('deleteExpense', () => {
    // --
    it('지출 데이터 삭제', async () => {
      const expense = TestMockData.expense({});
      const userId = 1;
      const delId = 1;

      jest.spyOn(sppService, 'deleteExpense').mockResolvedValue([expense]);

      const result = await sppController.deleteExpense(userId, delId);

      expect(result).toEqual([expense]);
      expect(sppService.deleteExpense).toHaveBeenCalledWith({
        userId,
        delId,
      });
    });
  });

  // --
  describe('addFixedExpense', () => {
    // --
    it('고정지출 데이터 추가', async () => {
      const fixedExpense = TestMockData.fixedExpense({});
      const userId = 1;
      const addFixedExpenseDto = TestMockData.addFixedExpenseDto({});

      jest.spyOn(sppService, 'addFixedExpense').mockResolvedValue([fixedExpense]);

      const result = await sppController.addFixedExpense(userId, addFixedExpenseDto);

      expect(result).toEqual([fixedExpense]);
      expect(sppService.addFixedExpense).toHaveBeenCalledWith({
        userId,
        addFixedExpenseDto,
      });
    });
  });

  // --
  describe('deleteFixedExpense', () => {
    // --
    it('고정지출 데이터 삭제', async () => {
      const fixedExpense = TestMockData.fixedExpense({});
      const userId = 1;
      const delId = 1;

      jest.spyOn(sppService, 'deleteFixedExpense').mockResolvedValue([fixedExpense]);

      const result = await sppController.deleteFixedExpense(userId, delId);

      expect(result).toEqual([fixedExpense]);
      expect(sppService.deleteFixedExpense).toHaveBeenCalledWith({
        userId,
        delId,
      });
    });
  });
});
