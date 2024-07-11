import { PickType } from '@nestjs/swagger';
import { Solar } from '../entities/solar.entity';
import { SRec } from '../entities/sRec.entity';

export class AddSolarDto extends PickType(Solar, ['generation', 'smp', 'supplyPrice']) {
  yearAndMonth: string;
}

export class DeleteSolarDto extends PickType(Solar, ['solarNumber']) {}

export class AddSRecDto extends PickType(SRec, ['sPrice', 'sVolume']) {
  date: string;
}

export class DeleteSRecDto extends PickType(SRec, ['sRecNumber']) {}
