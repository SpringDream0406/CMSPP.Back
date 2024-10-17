import { reqUser } from 'src/apis/01.Auth/interfaces/auth.interface';
import {
  AddExpenseDto,
  AddFixedExpenseDto,
  AddSRecDto,
  AddSolarDto,
} from '../dto/spp-container.dto';
import { IRfindOneByUserNumberForSpp } from 'src/apis/02.Users/interfaces/user-service.interface';

export interface IExistsByUserNumberFromSolar extends reqUser {
  date: string;
}

export interface IRFetchSpp extends Omit<IRfindOneByUserNumberForSpp, 'userNumber'> {}

export interface IAddSolarInput extends reqUser {
  addSolarDto: AddSolarDto;
}
export interface IDeleteSolarInput extends reqUser {
  solarNumber: number;
}

export interface IAddSRecInput extends reqUser {
  addSRecDto: AddSRecDto;
}
export interface IDeleteSRecInput extends reqUser {
  sRecNumber: number;
}

export interface IAddExpenseInput extends reqUser {
  addExpenseDto: AddExpenseDto;
}
export interface IDeleteExpenseInput extends reqUser {
  eNumber: number;
}

export interface IAddFixedExpenseInput extends reqUser {
  addFixedExpenseDto: AddFixedExpenseDto;
}
export interface IDeleteFixedExpenseInput extends reqUser {
  feNumber: number;
}
