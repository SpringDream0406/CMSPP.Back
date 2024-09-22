import { PickType } from '@nestjs/swagger';
import { Solar } from '../entities/solar.entity';
import { SRec } from '../entities/sRec.entity';
import { Expense } from '../entities/expense.entity';
import { FixedExpense } from '../entities/fixedExpense.entity';

export class AddSolarDto extends PickType(Solar, [
  'date',
  'generation',
  'smp',
  'supplyPrice',
]) {}
export class AddSRecDto extends PickType(SRec, ['date', 'sPrice', 'sVolume']) {}
export class AddExpenseDto extends PickType(Expense, ['date', 'eName', 'ePrice']) {}
export class AddFixedExpenseDto extends PickType(FixedExpense, [
  'startDate',
  'endDate',
  'feName',
  'fePrice',
]) {}
