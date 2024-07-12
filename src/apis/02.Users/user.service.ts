import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, UpdateResult } from 'typeorm';
import {
  IFindOneByBusinessNumber,
  IFindOneByUid,
  IRFindOneByUidForMyInfo,
  IRfindOneByUserNumberForSpp,
  IUpdateMyInfoInput,
} from './interfaces/user-service.interface';
import { reqUser } from '../01.Auth/interfaces/auth.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userReposityory: Repository<User>,
  ) {}

  // auth 로그인/회원가입 에서 사용 중
  findOneByUid({ uid }: IFindOneByUid): Promise<User> {
    return this.userReposityory.findOne({
      where: { auth: { uid } },
    });
  }

  // auth 회원탈퇴에서 사용 중
  findOneByUserNumber({ userNumber }: reqUser): Promise<User> {
    return this.userReposityory.findOne({
      where: { userNumber },
    });
  }

  // fetchSpp에서 사용 중
  findOneByUserNumberForSpp({
    userNumber,
  }: reqUser): Promise<IRfindOneByUserNumberForSpp> {
    return this.userReposityory.findOne({
      where: { userNumber },
      relations: ['solar', 'sRec', 'fixedExpense', 'expense'],
      select: [
        'userNumber',
        'kWh',
        'recWeight',
        'solar',
        'sRec',
        'fixedExpense',
        'expense',
      ],
    });
  }

  // businessNumber 중복 체크 (businessNumber는 string임)
  findOneByBusinessNumber({ businessNumber }: IFindOneByBusinessNumber): Promise<User> {
    return this.userReposityory.findOne({
      where: { businessNumber },
    });
  }

  // myInfo 데이터 가져오기
  findOneByUserNumberForMyInfo({
    userNumber,
  }: reqUser): Promise<IRFindOneByUidForMyInfo> {
    return this.userReposityory.findOne({
      select: ['kWh', 'recWeight', 'businessNumber', 'address'],
      where: { userNumber },
    });
  }

  // myInfo 업데이트 (DB)
  async updateMyInfoFromUser({
    userNumber,
    updateMyInfoDto,
  }: IUpdateMyInfoInput): Promise<UpdateResult> {
    const user = await this.findOneByBusinessNumber({
      businessNumber: updateMyInfoDto.businessNumber,
    });
    if (user.userNumber !== userNumber) throw new BadRequestException('중복');
    return this.userReposityory.update({ userNumber }, updateMyInfoDto);
  }

  // myInfo 업데이트
  async updateMyInfo({
    userNumber,
    updateMyInfoDto,
  }: IUpdateMyInfoInput): Promise<IRFindOneByUidForMyInfo> {
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
