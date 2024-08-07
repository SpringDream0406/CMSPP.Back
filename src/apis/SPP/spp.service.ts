import { BadRequestException, Injectable } from '@nestjs/common';
import {
  IAddExpenseInput,
  IAddSRecInput,
  IAddSolarInput,
  ICreateExpense,
  ICreateSRec,
  ICreateSolar,
  IDeleteSRecInput,
  IDeleteSolarInput,
  IFindOneByUidYearMonth,
  IRFetchSpp,
} from './interfaces/spp-service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Solar } from './entities/solar.entity';
import { Repository } from 'typeorm';
import { UserService } from '../02.Users/user.service';
import { SRec } from './entities/sRec.entity';
import { Expense } from './entities/expense.entity';
import { FixedExpense } from './entities/fixedExpense.entity';
import { reqUser } from '../01.Auth/interfaces/auth.interface';

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

  findByUserNumberFromSolar({ userNumber }: reqUser): Promise<Solar[]> {
    return this.solarRepository.find({
      where: { user: { userNumber } },
      order: { year: 'ASC', month: 'ASC' },
    });
  }

  findByUserNumberFromSRec({ userNumber }: reqUser): Promise<SRec[]> {
    return this.sRecRepository.find({
      where: { user: { userNumber } },
      order: { year: 'ASC', month: 'ASC', day: 'ASC' },
    });
  }

  findByUserNumberFromExpense({ userNumber }: reqUser): Promise<Expense[]> {
    return this.expenseRepository.find({
      where: { user: { userNumber } },
      order: { year: 'ASC', month: 'ASC', day: 'ASC' },
    });
  }

  findOneByUserNumberYearMonthFromSolar({
    userNumber,
    year,
    month,
  }: IFindOneByUidYearMonth): Promise<Solar> {
    return this.solarRepository.findOne({
      where: { user: { userNumber }, year, month },
    });
  }

  createSolar({ userNumber, addSolar }: ICreateSolar): Promise<Solar> {
    return this.solarRepository.save({ user: { userNumber }, ...addSolar });
  }

  createSRec({ userNumber, addSRec }: ICreateSRec): Promise<SRec> {
    return this.sRecRepository.save({ user: { userNumber }, ...addSRec });
  }

  createExpense({ userNumber, addExpense }: ICreateExpense) {
    return this.expenseRepository.save({ user: { userNumber }, ...addExpense });
  }

  async fetchSpp({ userNumber }: reqUser): Promise<IRFetchSpp> {
    const user = await this.userService.findOneByUserNumberForSpp({ userNumber });
    delete user.userNumber;
    return user;
  }

  // date 합쳐진거 분리
  splitDate(date: string): number[] {
    return date.split('-').map((part) => parseInt(part, 10));
  }

  // db에 맞는 date들 추가된 데이터 반환
  makeDate(data: any) {
    const { date, ...restData } = data;
    const [year, month, day] = this.splitDate(date);
    return { year, month, ...(day && { day }), ...restData };
  }

  async addSolar({ userNumber, addSolarDto }: IAddSolarInput): Promise<Solar[]> {
    const addSolar = this.makeDate(addSolarDto); // 년-월 합쳐진거 분리
    const result = await this.findOneByUserNumberYearMonthFromSolar({
      userNumber,
      year: addSolar.year,
      month: addSolar.month,
    }); // year, month 중복 체크
    if (result) throw new BadRequestException('중복');
    await this.createSolar({ userNumber, addSolar });
    const solar = await this.findByUserNumberFromSolar({ userNumber });
    return solar;
  }

  async deleteSolar({ userNumber, deleteSolarDto }: IDeleteSolarInput): Promise<Solar[]> {
    await this.solarRepository.delete({ user: { userNumber }, ...deleteSolarDto });
    const solar = await this.findByUserNumberFromSolar({ userNumber });
    return solar;
  }

  async addSRec({ userNumber, addSRecDto }: IAddSRecInput): Promise<SRec[]> {
    const addSRec = this.makeDate(addSRecDto); // 년-월-일 합쳐진거 분리
    await this.createSRec({ userNumber, addSRec });
    const sRec = await this.findByUserNumberFromSRec({ userNumber });
    return sRec;
  }

  async deleteSRec({ userNumber, deleteSRecDto }: IDeleteSRecInput): Promise<SRec[]> {
    await this.sRecRepository.delete({ user: { userNumber }, ...deleteSRecDto });
    const sRec = await this.findByUserNumberFromSRec({ userNumber });
    return sRec;
  }

  async addExpense({ userNumber, addExpenseDto }: IAddExpenseInput): Promise<Expense[]> {
    const addExpense = this.makeDate(addExpenseDto); // 년-월-일 합쳐진거 분리
    await this.createExpense({ userNumber, addExpense });
    const expense = await this.findByUserNumberFromExpense({ userNumber });
    return expense;
  }
}
