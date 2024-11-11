import { ExecutionContext } from '@nestjs/common';
import { Response } from 'express';
import { UpdateMyInfoDto } from 'src/apis/02.User/dto/user-container.dto';
import { Role, User } from 'src/apis/02.User/entities/user.entity';
import {
  AddExpenseDto,
  AddFixedExpenseDto,
  AddSolarDto,
  AddSRecDto,
} from 'src/apis/03.SPP/dto/spp-container.dto';
import { Expense } from 'src/apis/03.SPP/entities/expense.entity';
import { FixedExpense } from 'src/apis/03.SPP/entities/fixedExpense.entity';
import { Solar } from 'src/apis/03.SPP/entities/solar.entity';
import { SRec } from 'src/apis/03.SPP/entities/sRec.entity';
import { UpdateResult, DeleteResult } from 'typeorm';

export const mockUpdateResultAffected_1: UpdateResult = {
  generatedMaps: [],
  raw: [],
  affected: 1,
};

export const mockDeleteResultAffected_1: DeleteResult = { raw: [], affected: 1 };
export const mockDeleteResultAffected_0: DeleteResult = { raw: [], affected: 0 };

export const mockRes = {
  redirect: jest.fn(),
  setHeader: jest.fn(),
} as undefined as Response;

export const mockToken = 'mockToken';
export const mockSecret = 'mockSecret';

export const mockUserId = 1;
export const mockDelId = 1;

const date = '2024-11-11';
const baseData = {
  id: 1,
  user: {} as User,
  createdAt: new Date('2024-11-07T00:00:00Z'),
};

export const mockUpdateMyInfoDto: UpdateMyInfoDto = {
  kWh: 100,
  recWeight: 1,
  businessNumber: 123456789 as unknown as string,
  address: 'mockAddress',
};

export const mockAddSolarDto: AddSolarDto = {
  date: '2024-11',
  generation: 1,
  smp: 1,
  supplyPrice: 1,
};

export const mockAddSRecDto: AddSRecDto = {
  date,
  sPrice: 100,
  sVolume: 10,
};

export const mockAddExpenseDto: AddExpenseDto = {
  date,
  eName: 'mockName',
  ePrice: 100,
};

export const mockAddFixedExpenseDto: AddFixedExpenseDto = {
  startDate: '2023-01',
  endDate: '2024-11',
  feName: 'mockName',
  fePrice: 100,
};

export const mockSolar: Solar = {
  ...mockAddSolarDto,
  ...baseData,
};

export const mockSRec: SRec = {
  ...mockAddSRecDto,
  ...baseData,
};

export const mockExpense: Expense = {
  ...mockAddExpenseDto,
  ...baseData,
};

export const mockFixedExpense: FixedExpense = {
  ...mockAddFixedExpenseDto,
  ...baseData,
};

export const mockUser: User = {
  id: mockUserId,
  ...mockUpdateMyInfoDto,
  solar: [mockSolar],
  sRec: [mockSRec],
  expense: [mockExpense],
  fixedExpense: [mockFixedExpense],
  role: Role.USER,
  createdAt: new Date('2024-11-07T00:00:00Z'),
};

export const createMockExecutionContext = (mockReq: any) =>
  ({
    switchToHttp: () => ({ getRequest: () => mockReq }),
  }) as ExecutionContext;
