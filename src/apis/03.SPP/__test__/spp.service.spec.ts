import { TestBed } from '@automock/jest';
import { SppService } from '../spp.service';
import { Repository } from 'typeorm';
import { Solar } from '../entity/solar.entity';
import { SRec } from '../entity/sRec.entity';
import { Expense } from '../entity/expense.entity';
import { FixedExpense } from '../entity/fixedExpense.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from 'src/apis/02.User/user.service';
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
} from 'src/common/__test__/unit.mockdata';
import { BadRequestException } from '@nestjs/common';

describe('SppService', () => {
  let sppService: SppService;
  let userService: jest.Mocked<UserService>;
  let solarRepository: jest.Mocked<Repository<Solar>>;
  let sRecRepository: jest.Mocked<Repository<SRec>>;
  let expenseRepository: jest.Mocked<Repository<Expense>>;
  let fixedExpenseRepository: jest.Mocked<Repository<FixedExpense>>;

  beforeEach(() => {
    const { unit, unitRef } = TestBed.create(SppService).compile();

    sppService = unit;
    userService = unitRef.get(UserService);
    solarRepository = unitRef.get(getRepositoryToken(Solar) as string);
    sRecRepository = unitRef.get(getRepositoryToken(SRec) as string);
    expenseRepository = unitRef.get(getRepositoryToken(Expense) as string);
    fixedExpenseRepository = unitRef.get(getRepositoryToken(FixedExpense) as string);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(sppService).toBeDefined();
  });

  describe('fetchSpp', () => {
    it('Spp 조회하기', async () => {
      const mockUserWithoutId = { ...mockUser };
      delete mockUserWithoutId.id;

      jest.spyOn(userService, 'findOneByUserIdForSpp').mockResolvedValue(mockUser);

      const reuslt = await sppService.fetchSpp({ userId: mockUserId });

      expect(reuslt).toEqual(mockUserWithoutId);
    });
  });

  describe('addSolar', () => {
    it('태양광 데이터 추가 성공', async () => {
      jest.spyOn(sppService, 'existsByUserIdFromSolar').mockResolvedValue(false);
      jest.spyOn(sppService, 'saveSolar').mockResolvedValue(undefined);
      jest.spyOn(sppService, 'findByUserIdFromSolar').mockResolvedValue([mockSolar]);

      const result = await sppService.addSolar({
        userId: mockUserId,
        addSolarDto: mockAddSolarDto,
      });

      expect(result).toEqual([mockSolar]);
      expect(sppService.existsByUserIdFromSolar).toHaveBeenCalledWith({
        userId: mockUserId,
        date: mockAddSolarDto.date,
      });
      expect(sppService.saveSolar).toHaveBeenCalledWith({
        userId: mockUserId,
        addSolarDto: mockAddSolarDto,
      });
      expect(sppService.findByUserIdFromSolar).toHaveBeenCalledWith({
        userId: mockUserId,
      });
    });

    it('태양광 데이터 추가 실패: 월 데이터 중복', () => {
      jest.spyOn(sppService, 'existsByUserIdFromSolar').mockResolvedValue(true);

      expect(
        sppService.addSolar({ userId: mockUserId, addSolarDto: mockAddSolarDto }),
      ).rejects.toThrow(BadRequestException);
      expect(sppService.existsByUserIdFromSolar).toHaveBeenCalledWith({
        userId: mockUserId,
        date: mockAddSolarDto.date,
      });
    });
  });

  describe('deleteSolar', () => {
    it('태양광 데이터 삭제', async () => {
      jest.spyOn(solarRepository, 'delete').mockResolvedValue(undefined);
      jest.spyOn(sppService, 'findByUserIdFromSolar').mockResolvedValue([mockSolar]);

      const result = await sppService.deleteSolar({
        userId: mockUserId,
        delId: mockDelId,
      });

      expect(result).toEqual([mockSolar]);
      expect(solarRepository.delete).toHaveBeenCalledWith({
        user: { id: mockUserId },
        id: mockDelId,
      });
      expect(sppService.findByUserIdFromSolar).toHaveBeenCalledWith({
        userId: mockUserId,
      });
    });
  });

  describe('addSRec', () => {
    it('SRec 데이터 추가', async () => {
      jest.spyOn(sppService, 'saveSRec').mockResolvedValue(undefined);
      jest.spyOn(sppService, 'findByUserIdFromSRec').mockResolvedValue([mockSRec]);

      const result = await sppService.addSRec({
        userId: mockUserId,
        addSRecDto: mockAddSRecDto,
      });

      expect(result).toEqual([mockSRec]);
      expect(sppService.saveSRec).toHaveBeenCalledWith({
        userId: mockUserId,
        addSRecDto: mockAddSRecDto,
      });
      expect(sppService.findByUserIdFromSRec).toHaveBeenCalledWith({
        userId: mockUserId,
      });
    });
  });

  describe('deleteSRec', () => {
    it('SRec 데이터 삭제', async () => {
      jest.spyOn(sRecRepository, 'delete').mockResolvedValue(undefined);
      jest.spyOn(sppService, 'findByUserIdFromSRec').mockResolvedValue([mockSRec]);

      const result = await sppService.deleteSRec({
        userId: mockUserId,
        delId: mockDelId,
      });

      expect(result).toEqual([mockSRec]);
      expect(sRecRepository.delete).toHaveBeenCalledWith({
        user: { id: mockUserId },
        id: mockDelId,
      });
      expect(sppService.findByUserIdFromSRec).toHaveBeenCalledWith({
        userId: mockUserId,
      });
    });
  });

  describe('addExpense', () => {
    it('지출 데이터 추가', async () => {
      jest.spyOn(sppService, 'saveExpense').mockResolvedValue(undefined);
      jest.spyOn(sppService, 'findByUserIdFromExpense').mockResolvedValue([mockExpense]);

      const result = await sppService.addExpense({
        userId: mockUserId,
        addExpenseDto: mockAddExpenseDto,
      });

      expect(result).toEqual([mockExpense]);
      expect(sppService.saveExpense).toHaveBeenCalledWith({
        userId: mockUserId,
        addExpenseDto: mockAddExpenseDto,
      });
      expect(sppService.findByUserIdFromExpense).toHaveBeenCalledWith({
        userId: mockUserId,
      });
    });
  });

  describe('deleteExpense', () => {
    it('지출 데이터 삭제', async () => {
      jest.spyOn(expenseRepository, 'delete').mockResolvedValue(undefined);
      jest.spyOn(sppService, 'findByUserIdFromExpense').mockResolvedValue([mockExpense]);

      const result = await sppService.deleteExpense({
        userId: mockUserId,
        delId: mockDelId,
      });

      expect(result).toEqual([mockExpense]);
      expect(expenseRepository.delete).toHaveBeenCalledWith({
        user: { id: mockUserId },
        id: mockDelId,
      });
      expect(sppService.findByUserIdFromExpense).toHaveBeenCalledWith({
        userId: mockUserId,
      });
    });
  });

  describe('addFixedExpense', () => {
    beforeEach(() => {
      jest.spyOn(sppService, 'saveFixedExpense').mockResolvedValue(undefined);
    });

    it('고정지출 데이터 추가 성공', async () => {
      jest
        .spyOn(sppService, 'findByUserIdFromFixedExpense')
        .mockResolvedValue([mockFixedExpense]);

      const result = await sppService.addFixedExpense({
        userId: mockUserId,
        addFixedExpenseDto: mockAddFixedExpenseDto,
      });

      expect(result).toEqual([mockFixedExpense]);
      expect(sppService.saveFixedExpense).toHaveBeenLastCalledWith({
        userId: mockUserId,
        addFixedExpenseDto: mockAddFixedExpenseDto,
      });
      expect(sppService.findByUserIdFromFixedExpense).toHaveBeenCalledWith({
        userId: mockUserId,
      });
    });

    it('고정 지출 데이터 추가 실패: 시작날짜 > 종료날짜', () => {
      const mockAddFixedExpenseDto2 = {
        ...mockAddFixedExpenseDto,
        startDate: '2024-11',
        endDate: '2023-01',
      };

      expect(
        sppService.addFixedExpense({
          userId: mockUserId,
          addFixedExpenseDto: mockAddFixedExpenseDto2,
        }),
      ).rejects.toThrow(BadRequestException);
      expect(sppService.saveFixedExpense).not.toHaveBeenCalled();
    });
  });

  describe('deleteFixedExpense', () => {
    it('고정 지출 데이터 삭제', async () => {
      jest.spyOn(fixedExpenseRepository, 'delete').mockResolvedValue(undefined);
      jest
        .spyOn(sppService, 'findByUserIdFromFixedExpense')
        .mockResolvedValue([mockFixedExpense]);

      const result = await sppService.deleteFixedExpense({
        userId: mockUserId,
        delId: mockDelId,
      });

      expect(result).toEqual([mockFixedExpense]);
      expect(fixedExpenseRepository.delete).toHaveBeenCalledWith({
        user: { id: mockUserId },
        id: mockDelId,
      });
      expect(sppService.findByUserIdFromFixedExpense).toHaveBeenCalledWith({
        userId: mockUserId,
      });
    });
  });
});
