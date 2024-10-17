import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IAuthUser } from '../01.Auth/interfaces/auth.interface';
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

@Controller('spp')
export class SppController {
  constructor(private readonly sppService: SppService) {}

  @Get()
  @UseGuards(AuthGuard('access'))
  fetchSpp(@Req() req: Request & IAuthUser): Promise<IRFetchSpp> {
    return this.sppService.fetchSpp({ ...req.user });
  }

  @Put('solar')
  @UseGuards(AuthGuard('access'))
  addSolar(
    @Req() req: Request & IAuthUser,
    @Body() addSolarDto: AddSolarDto,
  ): Promise<Solar[]> {
    return this.sppService.addSolar({ ...req.user, addSolarDto });
  }

  @Delete('solar/:solarNumber')
  @UseGuards(AuthGuard('access'))
  deleteSolar(
    @Req() req: Request & IAuthUser,
    @Param('solarNumber', ParseIntPipe) solarNumber: number,
  ): Promise<Solar[]> {
    return this.sppService.deleteSolar({ ...req.user, solarNumber });
  }

  @Put('sRec')
  @UseGuards(AuthGuard('access'))
  addSRec(
    @Req() req: Request & IAuthUser,
    @Body() addSRecDto: AddSRecDto,
  ): Promise<SRec[]> {
    return this.sppService.addSRec({ ...req.user, addSRecDto });
  }

  @Delete('sRec/:sRecNumber')
  @UseGuards(AuthGuard('access'))
  deleteSRec(
    @Req() req: Request & IAuthUser,
    @Param('sRecNumber', ParseIntPipe) sRecNumber: number,
  ): Promise<SRec[]> {
    return this.sppService.deleteSRec({ ...req.user, sRecNumber });
  }

  @Put('expense')
  @UseGuards(AuthGuard('access'))
  addExpense(
    @Req() req: Request & IAuthUser,
    @Body() addExpenseDto: AddExpenseDto,
  ): Promise<Expense[]> {
    return this.sppService.addExpense({ ...req.user, addExpenseDto });
  }

  @Delete('expense/:eNumber')
  @UseGuards(AuthGuard('access'))
  deleteExpense(
    @Req() req: Request & IAuthUser,
    @Param('eNumber', ParseIntPipe) eNumber: number,
  ): Promise<Expense[]> {
    return this.sppService.deleteExpense({ ...req.user, eNumber });
  }

  @Put('fixedExpense')
  @UseGuards(AuthGuard('access'))
  addFixedExpense(
    @Req() req: Request & IAuthUser,
    @Body() addFixedExpenseDto: AddFixedExpenseDto,
  ): Promise<FixedExpense[]> {
    return this.sppService.addFixedExpense({ ...req.user, addFixedExpenseDto });
  }
  @Delete('/fixedExpense/:feNumber')
  @UseGuards(AuthGuard('access'))
  deleteFixedExpense(
    @Req() req: Request & IAuthUser,
    @Param('feNumber', ParseIntPipe) feNumber: number,
  ): Promise<FixedExpense[]> {
    return this.sppService.deleteFixedExpense({ ...req.user, feNumber });
  }
}
