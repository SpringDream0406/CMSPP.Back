import { userId } from 'src/apis/01.Auth/interface/auth.interface';
import {
  AddExpenseDto,
  AddFixedExpenseDto,
  AddSRecDto,
  AddSolarDto,
} from '../dto/spp-container.dto';
import { IRfindOneByUserIdForSpp } from 'src/apis/02.User/interface/user-service.interface';

export interface IExistsByUserIdFromSolar extends userId {
  date: string;
}

export interface IRFetchSpp extends Omit<IRfindOneByUserIdForSpp, 'id'> {}

export interface IAddSolarInput extends userId {
  addSolarDto: AddSolarDto;
}
export interface IAddSRecInput extends userId {
  addSRecDto: AddSRecDto;
}
export interface IAddExpenseInput extends userId {
  addExpenseDto: AddExpenseDto;
}
export interface IAddFixedExpenseInput extends userId {
  addFixedExpenseDto: AddFixedExpenseDto;
}

export interface IDeleteSppInput extends userId {
  delId: number;
}
