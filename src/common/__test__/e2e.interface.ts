import { User } from 'src/apis/02.User/entities/user.entity';
import { Expense } from 'src/apis/03.SPP/entities/expense.entity';
import { FixedExpense } from 'src/apis/03.SPP/entities/fixedExpense.entity';
import { Solar } from 'src/apis/03.SPP/entities/solar.entity';
import { SRec } from 'src/apis/03.SPP/entities/sRec.entity';
import { IRFetchSpp } from 'src/apis/03.SPP/interfaces/spp-service.interface';

interface E2eBase {
  statusCode: number;
}

export interface E2eError extends E2eBase {
  body: { message: string };
}

export interface E2eUpdate extends E2eBase {
  body: { affected: number };
}

// User
export interface E2eUser extends E2eBase {
  body: User;
}

// SPP
export interface E2eIRFetchSpp extends E2eBase {
  body: IRFetchSpp;
}

export interface E2eSolar extends E2eBase {
  body: Solar[];
}
export interface E2eSRec extends E2eBase {
  body: SRec[];
}
export interface E2eExpense extends E2eBase {
  body: Expense[];
}
export interface E2eFixedExpense extends E2eBase {
  body: FixedExpense[];
}
