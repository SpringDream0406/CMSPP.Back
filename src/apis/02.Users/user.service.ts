import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, UpdateResult } from 'typeorm';
import {
  IFindOneByBusinessNumber,
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

  // auth 회원탈퇴에서 사용 중
  findOneByUserNumber({ userNumber }: reqUser): Promise<User> {
    return this.userReposityory.findOne({
      where: { userNumber },
      relations: ['auth'],
    });
  }

  // spp에서 사용 중
  findOneByUserNumberForSpp({
    userNumber,
  }: reqUser): Promise<IRfindOneByUserNumberForSpp> {
    return this.userReposityory.findOne({
      where: { userNumber },
      relations: ['solar', 'sRec', 'expense', 'fixedExpense'],
      // 주소, 비즈니스 넘버 같은 필요없는 데이터 빼기
      select: [
        'userNumber',
        'kWh',
        'recWeight',
        'solar',
        'sRec',
        'fixedExpense',
        'expense',
      ],
      order: {
        solar: {
          date: 'ASC',
        },
        sRec: {
          date: 'ASC',
        },
        expense: {
          date: 'ASC',
        },
        fixedExpense: {
          startDate: 'ASC',
        },
      },
    });
  }

  // businessNumber 중복 체크, 값이 있어도 본인껀지 확인 위해 데이터 필요하므로 exists 사용 x
  findOneByBusinessNumber({ businessNumber }: IFindOneByBusinessNumber): Promise<User> {
    return this.userReposityory.findOne({
      where: { businessNumber },
    });
  }

  // User(myInfo) 데이터 가져오기
  findOneByUserNumberForMyInfo({ userNumber }: reqUser): Promise<User> {
    return this.userReposityory.findOne({
      where: { userNumber },
    });
  }

  // myInfo 업데이트
  async updateMyInfo({
    userNumber,
    updateMyInfoDto,
  }: IUpdateMyInfoInput): Promise<UpdateResult> {
    const user = await this.findOneByBusinessNumber({
      businessNumber: updateMyInfoDto.businessNumber,
    });
    if (user && user.userNumber !== userNumber)
      throw new BadRequestException('사업자 번호 중복');
    return this.userReposityory.update(userNumber, updateMyInfoDto);
  }
}
