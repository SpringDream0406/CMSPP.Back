import { ExecutionContext } from '@nestjs/common';
import { Request, Response } from 'express';
import { IOAuthUserData } from 'src/apis/01.Auth/interface/auth.interface';
import { UpdateMyInfoDto } from 'src/apis/02.User/dto/user-container.dto';
import { Role, User } from 'src/apis/02.User/entity/user.entity';
import {
  AddExpenseDto,
  AddFixedExpenseDto,
  AddSolarDto,
  AddSRecDto,
} from 'src/apis/03.SPP/dto/spp-container.dto';
import { Expense } from 'src/apis/03.SPP/entity/expense.entity';
import { FixedExpense } from 'src/apis/03.SPP/entity/fixedExpense.entity';
import { Solar } from 'src/apis/03.SPP/entity/solar.entity';
import { SRec } from 'src/apis/03.SPP/entity/sRec.entity';
import { UpdateResult, DeleteResult } from 'typeorm';
import { createResponse, createRequest } from 'node-mocks-http';
import {
  MDIAddExpenseDto,
  MDIAddFixedExpenseDto,
  MDIAddSolarDto,
  MDIAddSRecDto,
  MDIAuth,
  MDIBaseData,
  MDIDate,
  MDIDeleteResult,
  MDIOAuthUserData,
  MDISecret,
  MDIToken,
  MDIUpdateMyInfoDto,
  MDIUpdateResult,
} from '../interface/test.mockdata.interface';
import { Auth } from 'src/apis/01.Auth/entity/auth.entity';

export const TestMockData = {
  date({ date = '2024-11-11' }: MDIDate): string {
    return date;
  },

  baseData({
    id = 1,
    user = {} as User,
    createdAt = new Date('2024-11-07T00:00:00Z'),
  }: MDIBaseData): MDIBaseData {
    return {
      id,
      user,
      createdAt,
    };
  },

  deleteResult({ raw = [], affected = 1 }: MDIDeleteResult): DeleteResult {
    return { raw, affected };
  },

  updateResult({
    generatedMaps = [],
    raw = [],
    affected = 1,
  }: MDIUpdateResult): UpdateResult {
    return {
      generatedMaps,
      raw,
      affected,
    };
  },

  reqUser({ id = 'testId', provider = 'google' }: MDIOAuthUserData): IOAuthUserData {
    return { id, provider };
  },

  auth({ reqUser = this.reqUser({}), deletedAt = null, id = 1 }: MDIAuth): Auth {
    return {
      ...reqUser,
      user: { id, deletedAt },
    } as Auth;
  },

  req(): Request {
    return createRequest();
  },

  res(): Response {
    return createResponse();
  },

  token({ token = 'mockToken' }: MDIToken): string {
    return token;
  },

  secret({ secret = 'mockSecret' }: MDISecret): string {
    return secret;
  },

  updateMyInfoDto({
    kWh = 100,
    recWeight = 1,
    businessNumber = 123456789 as unknown as string,
    address = 'mockAddress',
  }: MDIUpdateMyInfoDto): UpdateMyInfoDto {
    return {
      kWh,
      recWeight,
      businessNumber,
      address,
    };
  },

  addSolarDto({
    date = '2024-11',
    generation = 1,
    smp = 1,
    supplyPrice = 1,
  }: MDIAddSolarDto): AddSolarDto {
    return {
      date,
      generation,
      smp,
      supplyPrice,
    };
  },

  addSRecDto({
    date = this.date({}),
    sPrice = 100,
    sVolume = 10,
  }: MDIAddSRecDto): AddSRecDto {
    return {
      date,
      sPrice,
      sVolume,
    };
  },

  addExpenseDto({
    date = this.date({}),
    eName = 'mockName',
    ePrice = 100,
  }: MDIAddExpenseDto): AddExpenseDto {
    return {
      date,
      eName,
      ePrice,
    };
  },

  addFixedExpenseDto({
    startDate = '2023-01',
    endDate = '2024-11',
    feName = 'mockName',
    fePrice = 100,
  }: MDIAddFixedExpenseDto): AddFixedExpenseDto {
    return {
      startDate,
      endDate,
      feName,
      fePrice,
    };
  },

  solar({ addSolarDto = this.addSolarDto({}), baseData = this.baseData({}) }): Solar {
    return {
      ...addSolarDto,
      ...baseData,
    };
  },

  sRec({ addSRecDto = this.addSRecDto({}), baseData = this.baseData({}) }): SRec {
    return {
      ...addSRecDto,
      ...baseData,
    };
  },

  expense({
    addExpenseDto = this.addExpenseDto({}),
    baseData = this.baseData({}),
  }): Expense {
    return {
      ...addExpenseDto,
      ...baseData,
    };
  },

  fixedExpense({
    addFixedExpenseDto = this.addFixedExpenseDto({}),
    baseData = this.baseData({}),
  }): FixedExpense {
    return {
      ...addFixedExpenseDto,
      ...baseData,
    };
  },

  user({
    id = 1,
    updateMyInfoDto = this.updateMyInfoDto({}),
    solar = [this.solar({})],
    sRec = [this.sRec({})],
    expense = [this.expense({})],
    fixedExpense = [this.fixedExpense({})],
    role = Role.USER,
    createdAt = new Date('2024-11-07T00:00:00Z'),
    deletedAt = null,
  }): User {
    return {
      id,
      ...updateMyInfoDto,
      solar,
      sRec,
      expense,
      fixedExpense,
      role,
      createdAt,
      deletedAt,
    };
  },

  executionContext(mock?: any): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => mock,
      }),
    } as ExecutionContext;
  },

  repository() {
    return {
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      softDelete: jest.fn(),
    };
  },
};
