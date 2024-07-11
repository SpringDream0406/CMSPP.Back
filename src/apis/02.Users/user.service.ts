import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, UpdateResult } from 'typeorm';
import {
  IFindOneByUidForMyInfo,
  IUpdateMyInfoInput,
} from './interfaces/user-service.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userReposityory: Repository<User>,
  ) {}

  // auth 로그인/회원가입 에서 사용 중
  findOneByUid({ uid }): Promise<User> {
    return this.userReposityory.findOne({
      where: { auth: { uid } },
    });
  }

  // auth 회원탈퇴에서 사용 중
  findOneByUserNumber({ userNumber }): Promise<User> {
    return this.userReposityory.findOne({
      where: { userNumber },
    });
  }

  // fetchSppData에서 사용 중
  findOneByUserNumberRelationed({ userNumber }): Promise<User> {
    return this.userReposityory.findOne({
      where: { userNumber },
      relations: ['solar', 'sRec', 'fixedExpense', 'expense'],
    });
  }

  // myInfo 데이터 가져오기
  findOneByUserNumberForMyInfo({ userNumber }): Promise<IFindOneByUidForMyInfo> {
    return this.userReposityory.findOne({
      select: ['kWh', 'recWeight', 'businessNumber', 'address'],
      where: { userNumber },
    });
  }

  // myInfo 업데이트 (DB)
  updateMyInfoFromUser({ userNumber, updateMyInfoDto }): Promise<UpdateResult> {
    return this.userReposityory.update({ userNumber }, updateMyInfoDto);
  }

  // myInfo 업데이트
  async updateMyInfo({
    userNumber,
    updateMyInfoDto,
  }: IUpdateMyInfoInput): Promise<IFindOneByUidForMyInfo> {
    const updateResult = await this.updateMyInfoFromUser({
      userNumber,
      updateMyInfoDto,
    });
    if (updateResult.affected) {
      return this.findOneByUserNumberForMyInfo({ userNumber });
    }
    throw new InternalServerErrorException('회원정보 업데이트 실패1(DB)');
  }
}
