import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IAuthUser } from '../01.Auth/interfaces/auth.interface';
import { UpdateMyInfoDto } from './dto/user-container.dto';
import { UserService } from './user.service';
import { IFindOneByUidForMyInfo } from './interfaces/user-service.interface';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  // myInfo 데이터 가져오기
  @Get('fetchMyInfo')
  @UseGuards(AuthGuard('access'))
  fetchKWhAndRecWeight(@Req() req: Request & IAuthUser): Promise<IFindOneByUidForMyInfo> {
    return this.userService.findOneByUserNumberForMyInfo({ ...req.user });
  }

  // myInfo 업데이트
  @Post('updateMyInfo')
  @UseGuards(AuthGuard('access'))
  updateMyInfo(
    @Req() req: Request & IAuthUser,
    @Body() updateMyInfoDto: UpdateMyInfoDto,
  ): Promise<IFindOneByUidForMyInfo> {
    return this.userService.updateMyInfo({
      ...req.user,
      updateMyInfoDto,
    });
  }
}
