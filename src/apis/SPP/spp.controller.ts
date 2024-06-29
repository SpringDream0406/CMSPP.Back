import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IAuthUser } from '../01.Auth/interfaces/auth.interface';
import { AddSolarDto, DeleteSolarDto } from './dto/spp-container.dto';
import { SppService } from './spp.service';
import { Solar } from './entities/solar.entity';

@Controller()
export class SppController {
  constructor(private readonly sppService: SppService) {}

  @Get('/fetchSppData')
  @UseGuards(AuthGuard('access'))
  fetchSppData(@Req() req: Request & IAuthUser) {
    return this.sppService.fetchSppData({ uid: req.user.uid });
  }

  // @Get('/fetchSolarData')
  // @UseGuards(AuthGuard('access'))
  // fetchSolarData(@Req() req: Request & IAuthUser) {
  //   return this.sppService.fetchSolarData({ uid: req.user.uid });
  // }

  @Post('/addSolar')
  @UseGuards(AuthGuard('access'))
  addSolarData(
    @Req() req: Request & IAuthUser,
    @Body() addSolarDto: AddSolarDto,
  ): Promise<Solar[]> {
    return this.sppService.addSolarData({ uid: req.user.uid, addSolarDto });
  }

  @Post('/deleteSolar')
  @UseGuards(AuthGuard('access'))
  deleteSolarData(
    @Req() req: Request & IAuthUser,
    @Body() deleteSolarDto: DeleteSolarDto,
  ): Promise<Solar[]> {
    return this.sppService.deletedSolarData({ uid: req.user.uid, deleteSolarDto });
  }
}
