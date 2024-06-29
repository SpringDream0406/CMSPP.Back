import { AddSolarDto, DeleteSolarDto } from '../dto/spp-container.dto';

export interface IFindOneByUidYearMonth {
  uid: string;
  year: number;
  month: number;
}

export interface IAddSolarInput {
  uid: string;
  addSolarDto: AddSolarDto;
}

export interface IDeleteSolarInput {
  uid: string;
  deleteSolarDto: DeleteSolarDto;
}
