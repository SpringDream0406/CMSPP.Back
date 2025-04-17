import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from './entity/user.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import {
  IFindOneByBusinessNumber,
  IRfindOneByUserIdForSpp,
  IUpdateMyInfoInput,
} from './interface/user-service.interface';
import { userId } from '../01.Auth/interface/auth.interface';
import { Auth } from '../01.Auth/entity/auth.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /* istanbul ignore next */
  /** spp 조회하기__ user로 묶인거 한번에 조회, spp에서 사용 중 */
  findOneByUserIdForSpp({ userId }: userId): Promise<IRfindOneByUserIdForSpp> {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ['solar', 'sRec', 'expense', 'fixedExpense'],
      // 주소 같은 필요없는 데이터 빼고 조회
      select: ['id', 'kWh', 'recWeight', 'solar', 'sRec', 'fixedExpense', 'expense'],
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

  /* istanbul ignore next */
  /** businessNumber 중복 체크__ 값이 있어도 본인껀지 확인 위해 데이터 필요하므로 exists 사용 x */
  findOneByBusinessNumber({ businessNumber }: IFindOneByBusinessNumber): Promise<User> {
    return this.userRepository.findOne({
      where: { businessNumber },
    });
  }

  /* istanbul ignore next */
  /** myInfo(User) 데이터 가져오기__ */
  findOneByUserIdForMyInfo({ userId }: userId): Promise<User> {
    return this.userRepository.findOne({
      where: { id: userId },
    });
  }

  /** myInfo 업데이트__ 들어오는 데이터들이 전부 필요하기떄문에 dto가 optional이 아님 */
  async updateMyInfo({
    userId,
    updateMyInfoDto,
  }: IUpdateMyInfoInput): Promise<UpdateResult> {
    const user = await this.findOneByBusinessNumber({
      businessNumber: updateMyInfoDto.businessNumber,
    });
    if (user && user.id !== userId) {
      throw new BadRequestException('사업자 번호 중복');
    }
    return this.userRepository.update({ id: userId }, updateMyInfoDto);
  }

  /** 회원탈퇴__ softDelete, 삭제 결과 없으면 에러 */
  async withdrawal({ userId }: userId): Promise<DeleteResult> {
    const result = await this.userRepository.softDelete({ id: userId });
    if (result.affected === 0) {
      throw new BadRequestException('탈퇴 실패 DB');
    }
    return result;
  }

  /* istanbul ignore next */
  /** 회원 재가입__ 탈퇴시 softDelete 상태를 null 처리 */
  restoreUser(auth: Auth): Promise<UpdateResult> {
    return this.userRepository.restore(auth.user.id);
  }
}
