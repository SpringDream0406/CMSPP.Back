import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IAuthUser } from '../01.Auth/interfaces/auth.interface';
import { UpdateMyInfoDto } from './dto/user-container.dto';
import { UserService } from './user.service';
import { IRFindOneByUidForMyInfo } from './interfaces/user-service.interface';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  // myInfo 데이터 가져오기
  @Get('fetchMyInfo')
  @UseGuards(AuthGuard('access'))
  fetchMyInfo(@Req() req: Request & IAuthUser): Promise<IRFindOneByUidForMyInfo> {
    return this.userService.findOneByUserNumberForMyInfo({ ...req.user });
  }

  // myInfo 업데이트
  @Post('updateMyInfo')
  @UseGuards(AuthGuard('access'))
  updateMyInfo(
    @Req() req: Request & IAuthUser,
    @Body() updateMyInfoDto: UpdateMyInfoDto,
  ): Promise<IRFindOneByUidForMyInfo> {
    return this.userService.updateMyInfo({
      ...req.user,
      updateMyInfoDto,
    });
  }
}
