import { OmitType } from '@nestjs/swagger';
import { Solar } from '../entities/solar.entity';

export class AddSolarDto extends OmitType(Solar, [
  // 'solarNumber',
  'user',
  'year',
  'month',
  'createdAt',
]) {
  yearAndMonth: string;
}
