import { reqUser } from 'src/apis/01.Auth/interfaces/auth.interface';
import {
  AddExpenseDto,
  AddFixedExpenseDto,
  AddSRecDto,
  AddSolarDto,
  DeleteExpenseDto,
  DeleteFixedExpenseDto,
  DeleteSRecDto,
  DeleteSolarDto,
} from '../dto/spp-container.dto';
import { Solar } from '../entities/solar.entity';
import { SRec } from '../entities/sRec.entity';
import { IRfindOneByUserNumberForSpp } from 'src/apis/02.Users/interfaces/user-service.interface';
import { Expense } from '../entities/expense.entity';
import { FixedExpense } from '../entities/fixedExpense.entity';

export interface IFindOneByUidYearMonth extends reqUser {
  year: number;
  month: number;
}

interface AddSolar extends Omit<Solar, 'solarNumber' | 'user' | 'createdAt'> {}
export interface ICreateSolar extends reqUser {
  addSolar: AddSolar;
}

interface AddSRec extends Omit<SRec, 'sRecNumber' | 'user' | 'createdAt'> {}
export interface ICreateSRec extends reqUser {
  addSRec: AddSRec;
}

interface AddExpense extends Omit<Expense, 'eNumber' | 'user' | 'createdAt'> {}
export interface ICreateExpense extends reqUser {
  addExpense: AddExpense;
}
interface AddFixedExpense extends Omit<FixedExpense, 'feNumber' | 'user' | 'createdAt'> {}
export interface ICreateFixedExpense extends reqUser {
  addFixedExpense: AddFixedExpense;
}

export interface IRFetchSpp extends Omit<IRfindOneByUserNumberForSpp, 'userNumber'> {}

export interface IAddSolarInput extends reqUser {
  addSolarDto: AddSolarDto;
}
export interface IDeleteSolarInput extends reqUser {
  deleteSolarDto: DeleteSolarDto;
}

export interface IAddSRecInput extends reqUser {
  addSRecDto: AddSRecDto;
}
export interface IDeleteSRecInput extends reqUser {
  deleteSRecDto: DeleteSRecDto;
}

export interface IAddExpenseInput extends reqUser {
  addExpenseDto: AddExpenseDto;
}
export interface IDeleteExpenseInput extends reqUser {
  deleteExpenseDto: DeleteExpenseDto;
}

export interface IAddFixedExpenseInput extends reqUser {
  addFixedExpenseDto: AddFixedExpenseDto;
}
export interface IDeleteFixedExpenseInput extends reqUser {
  deleteFixedExpenseDto: DeleteFixedExpenseDto;
}
