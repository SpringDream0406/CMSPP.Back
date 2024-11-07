import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Solar } from './entities/solar.entity';
import { SppService } from './spp.service';
import { SppController } from './spp.controller';
import { UserModule } from '../02.User/user.module';
import { FixedExpense } from './entities/fixedExpense.entity';
import { Expense } from './entities/expense.entity';
import { SRec } from './entities/sRec.entity';

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
