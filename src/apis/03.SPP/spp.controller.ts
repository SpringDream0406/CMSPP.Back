import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import {
  AddExpenseDto,
  AddFixedExpenseDto,
  AddSRecDto,
  AddSolarDto,
} from './dto/spp-container.dto';
import { SppService } from './spp.service';
import { Solar } from './entities/solar.entity';
import { SRec } from './entities/sRec.entity';
import { IRFetchSpp } from './interfaces/spp-service.interface';
import { Expense } from './entities/expense.entity';
import { FixedExpense } from './entities/fixedExpense.entity';
import { UserId } from 'src/common/decorator/userId.decorator';

@Controller('spp')
export class SppController {
  constructor(private readonly sppService: SppService) {}

  @Get()
  fetchSpp(@UserId() userId: number): Promise<IRFetchSpp> {
    return this.sppService.fetchSpp({ userId });
  }

  @Post('solar')
  addSolar(
    @UserId() userId: number, //
    @Body() addSolarDto: AddSolarDto,
  ): Promise<Solar[]> {
    return this.sppService.addSolar({ userId, addSolarDto });
  }

  @Delete('solar/:delId')
  deleteSolar(
    @UserId() userId: number, //
    @Param('delId', ParseIntPipe) delId: number,
  ): Promise<Solar[]> {
    return this.sppService.deleteSolar({ userId, delId });
  }

  @Post('sRec')
  addSRec(
    @UserId() userId: number, //
    @Body() addSRecDto: AddSRecDto,
  ): Promise<SRec[]> {
    return this.sppService.addSRec({ userId, addSRecDto });
  }

  @Delete('sRec/:delId')
  deleteSRec(
    @UserId() userId: number, //
    @Param('delId', ParseIntPipe) delId: number,
  ): Promise<SRec[]> {
    return this.sppService.deleteSRec({ userId, delId });
  }

  @Post('expense')
  addExpense(
    @UserId() userId: number, //
    @Body() addExpenseDto: AddExpenseDto,
  ): Promise<Expense[]> {
    return this.sppService.addExpense({ userId, addExpenseDto });
  }

  @Delete('expense/:delId')
  deleteExpense(
    @UserId() userId: number, //
    @Param('delId', ParseIntPipe) delId: number,
  ): Promise<Expense[]> {
    return this.sppService.deleteExpense({ userId, delId });
  }

  @Post('fixedExpense')
  addFixedExpense(
    @UserId() userId: number, //
    @Body() addFixedExpenseDto: AddFixedExpenseDto,
  ): Promise<FixedExpense[]> {
    return this.sppService.addFixedExpense({ userId, addFixedExpenseDto });
  }
  @Delete('/fixedExpense/:delId')
  deleteFixedExpense(
    @UserId() userId: number, //
    @Param('delId', ParseIntPipe) delId: number,
  ): Promise<FixedExpense[]> {
    return this.sppService.deleteFixedExpense({ userId, delId });
  }
}
