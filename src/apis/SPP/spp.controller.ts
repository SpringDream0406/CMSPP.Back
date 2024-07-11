import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IAuthUser } from '../01.Auth/interfaces/auth.interface';
import {
  AddSRecDto,
  AddSolarDto,
  DeleteSRecDto,
  DeleteSolarDto,
} from './dto/spp-container.dto';
import { SppService } from './spp.service';
import { Solar } from './entities/solar.entity';
import { SRec } from './entities/sRec.entity';

@Controller()
export class SppController {
  constructor(private readonly sppService: SppService) {}

  @Get('/fetchSppData')
  @UseGuards(AuthGuard('access'))
  fetchSppData(@Req() req: Request & IAuthUser) {
    return this.sppService.fetchSppData({ ...req.user });
  }

  @Post('/addSolar')
  @UseGuards(AuthGuard('access'))
  addSolarData(
    @Req() req: Request & IAuthUser,
    @Body() addSolarDto: AddSolarDto,
  ): Promise<Solar[]> {
    return this.sppService.addSolarData({ ...req.user, addSolarDto });
  }

  @Post('/deleteSolar')
  @UseGuards(AuthGuard('access'))
  deleteSolarData(
    @Req() req: Request & IAuthUser,
    @Body() deleteSolarDto: DeleteSolarDto,
  ): Promise<Solar[]> {
    return this.sppService.deleteSolarData({ ...req.user, deleteSolarDto });
  }

  @Post('/addSRec')
  @UseGuards(AuthGuard('access'))
  addSRecData(
    @Req() req: Request & IAuthUser,
    @Body() addSRecDto: AddSRecDto,
  ): Promise<SRec[]> {
    return this.sppService.addSRecData({ ...req.user, addSRecDto });
  }

  @Post('deleteSRec')
  @UseGuards(AuthGuard('access'))
  deleteSRecData(
    @Req() req: Request & IAuthUser,
    @Body() deleteSRecDto: DeleteSRecDto,
  ): Promise<SRec[]> {
    return this.sppService.deleteSRecData({ ...req.user, deleteSRecDto });
  }
}
