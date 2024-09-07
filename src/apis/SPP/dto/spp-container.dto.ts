import { PickType } from '@nestjs/swagger';
import { Solar } from '../entities/solar.entity';
import { SRec } from '../entities/sRec.entity';
import { Expense } from '../entities/expense.entity';
import { FixedExpense } from '../entities/fixedExpense.entity';

export class AddSolarDto extends PickType(Solar, ['generation', 'smp', 'supplyPrice']) {
  date: string;
}
export class DeleteSolarDto extends PickType(Solar, ['solarNumber']) {}

export class AddSRecDto extends PickType(SRec, ['sPrice', 'sVolume']) {
  date: string;
}
export class DeleteSRecDto extends PickType(SRec, ['sRecNumber']) {}

export class AddExpenseDto extends PickType(Expense, ['eName', 'ePrice']) {
  date: string;
}
export class DeleteExpenseDto extends PickType(Expense, ['eNumber']) {}

export class AddFixedExpenseDto extends PickType(FixedExpense, ['feName', 'fePrice']) {
  startDate: string;
  endDate: string;
}
export class DeleteFixedExpenseDto extends PickType(FixedExpense, ['feNumber']) {}
