import { Body, Controller, Get, Put } from '@nestjs/common';
import { UpdateMyInfoDto } from './dto/user-container.dto';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { UpdateResult } from 'typeorm';
import { UserId } from 'src/common/decorator/userId.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // myInfo 데이터 가져오기
  @Get()
  fetchMyInfo(@UserId() userId: number): Promise<User> {
    return this.userService.findOneByUserIdForMyInfo({ userId });
  }

  // myInfo 업데이트
  @Put()
  updateMyInfo(
    @UserId() userId: number,
    @Body() updateMyInfoDto: UpdateMyInfoDto,
  ): Promise<UpdateResult> {
    return this.userService.updateMyInfo({
      userId,
      updateMyInfoDto,
    });
  }
}
