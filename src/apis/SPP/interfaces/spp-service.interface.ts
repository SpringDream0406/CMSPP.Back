import {
  AddSRecDto,
  AddSolarDto,
  DeleteSRecDto,
  DeleteSolarDto,
} from '../dto/spp-container.dto';

export interface IFindOneByUidYearMonth {
  userNumber: number;
  year: number;
  month: number;
}

export interface IAddSolarInput {
  userNumber: number;
  addSolarDto: AddSolarDto;
}

export interface IDeleteSolarInput {
  userNumber: number;
  deleteSolarDto: DeleteSolarDto;
}

export interface IAddSRecInput {
  userNumber: number;
  addSRecDto: AddSRecDto;
}

export interface IDeleteSRecInput {
  userNumber: number;
  deleteSRecDto: DeleteSRecDto;
}
