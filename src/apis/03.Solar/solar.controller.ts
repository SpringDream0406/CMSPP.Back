import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { SolarService } from './solar.service';
import { AuthGuard } from '@nestjs/passport';
import { IAuthUser } from '../01.Auth/interfaces/auth.interface';
import { AddSolarDto } from './dto/solar-container.dto';

@Controller()
export class SolarController {
  constructor(private readonly solarService: SolarService) {}

  @Post('/addSolar')
  @UseGuards(AuthGuard('access'))
  addSolarData(
    @Req() req: Request & IAuthUser,
    @Body() addSolarDto: AddSolarDto,
  ): Promise<{ message: string }> {
    return this.solarService.addSolarData({ uid: req.user.uid, addSolarDto });
  }
}
