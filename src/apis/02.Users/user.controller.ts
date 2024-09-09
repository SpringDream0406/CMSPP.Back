import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IAuthUser } from '../01.Auth/interfaces/auth.interface';
import { UpdateMyInfoDto } from './dto/user-container.dto';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { UpdateResult } from 'typeorm';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // myInfo 데이터 가져오기
  @Get()
  @UseGuards(AuthGuard('access'))
  fetchMyInfo(@Req() req: Request & IAuthUser): Promise<User> {
    return this.userService.findOneByUserNumberForMyInfo({ ...req.user });
  }

  // myInfo 업데이트
  @Put()
  @UseGuards(AuthGuard('access'))
  updateMyInfo(
    @Req() req: Request & IAuthUser,
    @Body() updateMyInfoDto: UpdateMyInfoDto,
  ): Promise<UpdateResult> {
    return this.userService.updateMyInfo({
      ...req.user,
      updateMyInfoDto,
    });
  }
}
