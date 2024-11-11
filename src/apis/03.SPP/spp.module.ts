import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Solar } from './entity/solar.entity';
import { SppService } from './spp.service';
import { SppController } from './spp.controller';
import { UserModule } from '../02.User/user.module';
import { FixedExpense } from './entity/fixedExpense.entity';
import { Expense } from './entity/expense.entity';
import { SRec } from './entity/sRec.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Solar, //
      SRec,
      Expense,
      FixedExpense,
    ]),
    UserModule,
  ],
  providers: [
    SppService, //
  ],
  controllers: [
    SppController, //
  ],
})
export class SppModule {}
