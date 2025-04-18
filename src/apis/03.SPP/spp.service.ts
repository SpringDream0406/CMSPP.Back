import { BadRequestException, Injectable } from '@nestjs/common';
import {
  IAddExpenseInput,
  IAddFixedExpenseInput,
  IAddSRecInput,
  IAddSolarInput,
  IDeleteSppInput,
  IExistsByUserIdFromSolar,
  IRFetchSpp,
} from './interface/spp-service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Solar } from './entity/solar.entity';
import { Repository } from 'typeorm';
import { UserService } from '../02.User/user.service';
import { SRec } from './entity/sRec.entity';
import { Expense } from './entity/expense.entity';
import { FixedExpense } from './entity/fixedExpense.entity';
import { userId } from '../01.Auth/interface/auth.interface';

@Injectable()
export class SppService {
  constructor(
    private readonly userService: UserService,
    @InjectRepository(Solar)
    private readonly solarRepository: Repository<Solar>,
    @InjectRepository(SRec)
    private readonly sRecRepository: Repository<SRec>,
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(FixedExpense)
    private readonly fixedExpenseRepository: Repository<FixedExpense>,
  ) {}

  /* istanbul ignore next */
  /** 데이터 조회__ ASC */
  findByUserIdFromSolar({ userId }: userId): Promise<Solar[]> {
    return this.solarRepository.find({
      where: { user: { id: userId } },
      order: { date: 'ASC' },
    });
  }

  /* istanbul ignore next */
  /** 데이터 조회__ ASC */
  findByUserIdFromSRec({ userId }: userId): Promise<SRec[]> {
    return this.sRecRepository.find({
      where: { user: { id: userId } },
      order: { date: 'ASC' },
    });
  }

  /* istanbul ignore next */
  /** 데이터 조회__ ASC */
  findByUserIdFromExpense({ userId }: userId): Promise<Expense[]> {
    return this.expenseRepository.find({
      where: { user: { id: userId } },
      order: { date: 'ASC' },
    });
  }

  /* istanbul ignore next */
  /** 데이터 조회__ ASC */
  findByUserIdFromFixedExpense({ userId }: userId): Promise<FixedExpense[]> {
    return this.fixedExpenseRepository.find({
      where: { user: { id: userId } },
      order: { startDate: 'ASC' },
    });
  }

  /* istanbul ignore next */
  /** 중복 조회__ solar의 같은 월 데이터 있는지 중복 조회*/
  existsByUserIdFromSolar({ userId, date }: IExistsByUserIdFromSolar): Promise<boolean> {
    return this.solarRepository.exists({
      where: { user: { id: userId }, date },
    });
  }

  /* istanbul ignore next */
  saveSolar({ userId, addSolarDto }: IAddSolarInput): Promise<Solar> {
    return this.solarRepository.save({ user: { id: userId }, ...addSolarDto });
  }

  /* istanbul ignore next */
  saveSRec({ userId, addSRecDto }: IAddSRecInput): Promise<SRec> {
    return this.sRecRepository.save({ user: { id: userId }, ...addSRecDto });
  }

  /* istanbul ignore next */
  saveExpense({ userId, addExpenseDto }: IAddExpenseInput) {
    return this.expenseRepository.save({ user: { id: userId }, ...addExpenseDto });
  }

  /* istanbul ignore next */
  saveFixedExpense({ userId, addFixedExpenseDto }: IAddFixedExpenseInput) {
    return this.fixedExpenseRepository.save({
      user: { id: userId },
      ...addFixedExpenseDto,
    });
  }

  /** Spp 조회하기__ */
  async fetchSpp({ userId }: userId): Promise<IRFetchSpp> {
    const user = await this.userService.findOneByUserIdForSpp({ userId });
    delete user.id; // 유저번호 삭제해서 보내기
    return user;
  }

  /** 태양광 데이터 추가__ 월 데이터 중복 체크 */
  async addSolar({ userId, addSolarDto }: IAddSolarInput): Promise<Solar[]> {
    // 중복 체크
    const result = await this.existsByUserIdFromSolar({
      userId,
      date: addSolarDto.date,
    });
    if (result) {
      throw new BadRequestException('중복');
    }
    await this.saveSolar({ userId, addSolarDto });
    const solar = await this.findByUserIdFromSolar({ userId });
    return solar;
  }

  async deleteSolar({ userId, delId }: IDeleteSppInput): Promise<Solar[]> {
    await this.solarRepository.delete({ user: { id: userId }, id: delId });
    const solar = await this.findByUserIdFromSolar({ userId });
    return solar;
  }

  async addSRec({ userId, addSRecDto }: IAddSRecInput): Promise<SRec[]> {
    await this.saveSRec({ userId, addSRecDto });
    const sRec = await this.findByUserIdFromSRec({ userId });
    return sRec;
  }

  async deleteSRec({ userId, delId }: IDeleteSppInput): Promise<SRec[]> {
    await this.sRecRepository.delete({ user: { id: userId }, id: delId });
    const sRec = await this.findByUserIdFromSRec({ userId });
    return sRec;
  }

  async addExpense({ userId, addExpenseDto }: IAddExpenseInput): Promise<Expense[]> {
    await this.saveExpense({ userId, addExpenseDto });
    const expense = await this.findByUserIdFromExpense({ userId });
    return expense;
  }

  async deleteExpense({ userId, delId }: IDeleteSppInput): Promise<Expense[]> {
    await this.expenseRepository.delete({ user: { id: userId }, id: delId });
    const expense = await this.findByUserIdFromExpense({ userId });
    return expense;
  }

  /** 고정지출 데이터 추가__ 시작날짜 > 종료날짜 오류 체크 */
  async addFixedExpense({
    userId,
    addFixedExpenseDto,
  }: IAddFixedExpenseInput): Promise<FixedExpense[]> {
    const startDate = addFixedExpenseDto.startDate;
    const endDate = addFixedExpenseDto.endDate;
    if (startDate > endDate) {
      throw new BadRequestException('년도');
    }
    await this.saveFixedExpense({ userId, addFixedExpenseDto });
    const fixedExpense = await this.findByUserIdFromFixedExpense({ userId });
    return fixedExpense;
  }

  async deleteFixedExpense({ userId, delId }: IDeleteSppInput): Promise<FixedExpense[]> {
    await this.fixedExpenseRepository.delete({
      user: { id: userId },
      id: delId,
    });
    const fixedExpense = await this.findByUserIdFromFixedExpense({ userId });
    return fixedExpense;
  }
}

// date 합쳐진거 분리
// splitDate(date: string): number[] {
//   return date.split('-').map((part) => parseInt(part, 10));
// }

// db에 맞는 date들 추가된 데이터 반환
// makeDate(data: any) {
//   const { date, ...restData } = data;
//   const [year, month, day] = this.splitDate(date);
//   return { year, month, ...(day && { day }), ...restData };
// }
