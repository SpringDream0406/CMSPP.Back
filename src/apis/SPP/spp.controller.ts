import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IAuthUser } from '../01.Auth/interfaces/auth.interface';
import {
  AddExpenseDto,
  AddFixedExpenseDto,
  AddSRecDto,
  AddSolarDto,
  DeleteExpenseDto,
  DeleteFixedExpenseDto,
  DeleteSRecDto,
  DeleteSolarDto,
} from './dto/spp-container.dto';
import { SppService } from './spp.service';
import { Solar } from './entities/solar.entity';
import { SRec } from './entities/sRec.entity';
import { IRFetchSpp } from './interfaces/spp-service.interface';
import { Expense } from './entities/expense.entity';
import { FixedExpense } from './entities/fixedExpense.entity';

@Controller()
export class SppController {
  constructor(private readonly sppService: SppService) {}

  @Get('/fetchSpp')
  @UseGuards(AuthGuard('access'))
  fetchSpp(@Req() req: Request & IAuthUser): Promise<IRFetchSpp> {
    return this.sppService.fetchSpp({ ...req.user });
  }

  @Post('/addSolar')
  @UseGuards(AuthGuard('access'))
  addSolar(
    @Req() req: Request & IAuthUser,
    @Body() addSolarDto: AddSolarDto,
  ): Promise<Solar[]> {
    return this.sppService.addSolar({ ...req.user, addSolarDto });
  }

  @Post('/deleteSolar')
  @UseGuards(AuthGuard('access'))
  deleteSolar(
    @Req() req: Request & IAuthUser,
    @Body() deleteSolarDto: DeleteSolarDto,
  ): Promise<Solar[]> {
    return this.sppService.deleteSolar({ ...req.user, deleteSolarDto });
  }

  @Post('/addSRec')
  @UseGuards(AuthGuard('access'))
  addSRec(
    @Req() req: Request & IAuthUser,
    @Body() addSRecDto: AddSRecDto,
  ): Promise<SRec[]> {
    return this.sppService.addSRec({ ...req.user, addSRecDto });
  }

  @Post('/deleteSRec')
  @UseGuards(AuthGuard('access'))
  deleteSRec(
    @Req() req: Request & IAuthUser,
    @Body() deleteSRecDto: DeleteSRecDto,
  ): Promise<SRec[]> {
    return this.sppService.deleteSRec({ ...req.user, deleteSRecDto });
  }

  @Post('/addExpense')
  @UseGuards(AuthGuard('access'))
  addExpense(
    @Req() req: Request & IAuthUser,
    @Body() addExpenseDto: AddExpenseDto,
  ): Promise<Expense[]> {
    return this.sppService.addExpense({ ...req.user, addExpenseDto });
  }

  @Post('/deleteExpense')
  @UseGuards(AuthGuard('access'))
  deleteExpense(
    @Req() req: Request & IAuthUser,
    @Body() deleteExpenseDto: DeleteExpenseDto,
  ): Promise<Expense[]> {
    return this.sppService.deleteExpense({ ...req.user, deleteExpenseDto });
  }

  @Post('/addFixedExpense')
  @UseGuards(AuthGuard('access'))
  addFixedExpense(
    @Req() req: Request & IAuthUser,
    @Body() addFixedExpenseDto: AddFixedExpenseDto,
  ): Promise<FixedExpense[]> {
    return this.sppService.addFixedExpense({ ...req.user, addFixedExpenseDto });
  }
  @Post('/deleteFixedExpense')
  @UseGuards(AuthGuard('access'))
  deleteFixedExpense(
    @Req() req: Request & IAuthUser,
    @Body() deleteFixedExpenseDto: DeleteFixedExpenseDto,
  ): Promise<FixedExpense[]> {
    return this.sppService.deleteFixedExpense({ ...req.user, deleteFixedExpenseDto });
  }
}
