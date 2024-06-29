import { OmitType, PickType } from '@nestjs/swagger';
import { Solar } from '../entities/solar.entity';

export class AddSolarDto extends OmitType(Solar, [
  'solarNumber',
  'user',
  'year',
  'month',
  'createdAt',
]) {
  yearAndMonth: string;
}

export class DeleteSolarDto extends PickType(Solar, ['year', 'month']) {}
