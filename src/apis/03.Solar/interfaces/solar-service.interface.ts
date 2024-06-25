import { AddSolarDto } from '../dto/solar-container.dto';

export interface IFindOneByUidYearMonth {
  uid: string;
  year: number;
  month: number;
}

export interface IAddSolarInput {
  uid: string;
  addSolarDto: AddSolarDto;
}
