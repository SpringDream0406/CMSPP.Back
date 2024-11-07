import { TestBed } from '@automock/jest';
import { SppController } from '../spp.controller';
import { SppService } from '../spp.service';
import {
  mockAddExpenseDto,
  mockAddFixedExpenseDto,
  mockAddSolarDto,
  mockAddSRecDto,
  mockDelId,
  mockExpense,
  mockFixedExpense,
  mockSolar,
  mockSRec,
  mockUser,
  mockUserId,
} from 'src/common/__test__/mockDatas';

describe('SppController', () => {
  let sppController: SppController;
  let sppService: jest.Mocked<SppService>;

  beforeEach(() => {
    const { unit, unitRef } = TestBed.create(SppController).compile();

    sppController = unit;
    sppService = unitRef.get<SppService>(SppService);
  });

  it('should be defined', () => {
    expect(SppController).toBeDefined();
  });

  describe('fetchSpp', () => {
    it('Spp 조회하기', async () => {
      jest.spyOn(sppService, 'fetchSpp').mockResolvedValue(mockUser);

      const result = await sppController.fetchSpp(mockUserId);

      expect(result).toBe(mockUser);
      expect(sppService.fetchSpp).toHaveBeenCalledWith({ userId: mockUserId });
    });
  });

  describe('addSolar', () => {
    it('태양광 데이터 추가', async () => {
      jest.spyOn(sppService, 'addSolar').mockResolvedValue([mockSolar]);

      const result = await sppController.addSolar(mockUserId, mockAddSolarDto);

      expect(result).toEqual([mockSolar]);
      expect(sppService.addSolar).toHaveBeenCalledWith({
        userId: mockUserId,
        addSolarDto: mockAddSolarDto,
      });
    });
  });

  describe('deleteSolar', () => {
    it('태양광 데이터 삭제', async () => {
      jest.spyOn(sppService, 'deleteSolar').mockResolvedValue([mockSolar]);

      const result = await sppController.deleteSolar(mockUserId, mockDelId);

      expect(result).toEqual([mockSolar]);
      expect(sppService.deleteSolar).toHaveBeenCalledWith({
        userId: mockUserId,
        delId: mockDelId,
      });
    });
  });

  describe('addSRec', () => {
    it('SRec 데이터 추가', async () => {
      jest.spyOn(sppService, 'addSRec').mockResolvedValue([mockSRec]);

      const result = await sppController.addSRec(mockUserId, mockAddSRecDto);

      expect(result).toEqual([mockSRec]);
      expect(sppService.addSRec).toHaveBeenLastCalledWith({
        userId: mockUserId,
        addSRecDto: mockAddSRecDto,
      });
    });
  });

  describe('deleteSRec', () => {
    it('SRec 데이터 삭제', async () => {
      jest.spyOn(sppService, 'deleteSRec').mockResolvedValue([mockSRec]);

      const result = await sppController.deleteSRec(mockUserId, mockDelId);

      expect(result).toEqual([mockSRec]);
      expect(sppService.deleteSRec).toHaveBeenCalledWith({
        userId: mockUserId,
        delId: mockDelId,
      });
    });

    describe('addExpense', () => {
      it('지출 데이터 추가', async () => {
        jest.spyOn(sppService, 'addExpense').mockResolvedValue([mockExpense]);

        const result = await sppController.addExpense(mockUserId, mockAddExpenseDto);

        expect(result).toEqual([mockExpense]);
        expect(sppService.addExpense).toHaveBeenCalledWith({
          userId: mockUserId,
          addExpenseDto: mockAddExpenseDto,
        });
      });
    });
  });

  describe('deleteExpense', () => {
    it('지출 데이터 삭제', async () => {
      jest.spyOn(sppService, 'deleteExpense').mockResolvedValue([mockExpense]);

      const result = await sppController.deleteExpense(mockUserId, mockDelId);

      expect(result).toEqual([mockExpense]);
      expect(sppService.deleteExpense).toHaveBeenCalledWith({
        userId: mockUserId,
        delId: mockDelId,
      });
    });
  });

  describe('addFixedExpense', () => {
    it('고정지출 데이터 추가', async () => {
      jest.spyOn(sppService, 'addFixedExpense').mockResolvedValue([mockFixedExpense]);

      const result = await sppController.addFixedExpense(
        mockUserId,
        mockAddFixedExpenseDto,
      );

      expect(result).toEqual([mockFixedExpense]);
      expect(sppService.addFixedExpense).toHaveBeenCalledWith({
        userId: mockUserId,
        addFixedExpenseDto: mockAddFixedExpenseDto,
      });
    });
  });

  describe('deleteFixedExpense', () => {
    it('고정지출 데이터 삭제', async () => {
      jest.spyOn(sppService, 'deleteFixedExpense').mockResolvedValue([mockFixedExpense]);

      const result = await sppController.deleteFixedExpense(mockUserId, mockDelId);

      expect(result).toEqual([mockFixedExpense]);
      expect(sppService.deleteFixedExpense).toHaveBeenCalledWith({
        userId: mockUserId,
        delId: mockDelId,
      });
    });
  });
});
