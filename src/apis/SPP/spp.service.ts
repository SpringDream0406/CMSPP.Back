import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  IAddExpenseInput,
  IAddFixedExpenseInput,
  IAddSRecInput,
  IAddSolarInput,
  ICreateExpense,
  ICreateFixedExpense,
  ICreateSRec,
  ICreateSolar,
  IDeleteExpenseInput,
  IDeleteFixedExpenseInput,
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

  findByUserNumberFromFixedExpense({ userNumber }: reqUser): Promise<FixedExpense[]> {
    return this.fixedExpenseRepository.find({
      where: { user: { userNumber } },
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

  createFixedExpense({ userNumber, addFixedExpense }: ICreateFixedExpense) {
    return this.fixedExpenseRepository.save({ user: { userNumber }, ...addFixedExpense });
  }

  async fetchSpp({ userNumber }: reqUser): Promise<IRFetchSpp> {
    const user = await this.userService.findOneByUserNumberForSpp({ userNumber });
    delete user.userNumber; // 유저번호 삭제해서 보내기
    return user;
  }

  // date 합쳐진거 분리
  // splitDate(date: string): number[] {
  //   return date.split('-').map((part) => parseInt(part, 10));
  // }

  // db에 맞는 date들 추가된 데이터 반환
  makeDate(data: any) {
    const { date, ...restData } = data;
    const [year, month, day] = this.splitDate(date);
    return { year, month, ...(day && { day }), ...restData };
  }

  // 삭제 요청에 데이터 넘버 있는지 체크
  checkDeleteReqNumber(number: number, name: string) {
    if (!number) throw new BadRequestException(`요청에 ${name} 없음`);
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

  async deleteSolar({ userNumber, solarNumber }: IDeleteSolarInput): Promise<Solar[]> {
    this.checkDeleteReqNumber(userNumber, 'solarNumber');
    await this.solarRepository.delete({ user: { userNumber }, solarNumber });
    const solar = await this.findByUserNumberFromSolar({ userNumber });
    return solar;
  }

  async addSRec({ userNumber, addSRecDto }: IAddSRecInput): Promise<SRec[]> {
    const addSRec = this.makeDate(addSRecDto); // 년-월-일 합쳐진거 분리
    await this.createSRec({ userNumber, addSRec });
    const sRec = await this.findByUserNumberFromSRec({ userNumber });
    return sRec;
  }

  async deleteSRec({ userNumber, sRecNumber }: IDeleteSRecInput): Promise<SRec[]> {
    this.checkDeleteReqNumber(sRecNumber, 'sRecNumber');
    await this.sRecRepository.delete({ user: { userNumber }, sRecNumber });
    const sRec = await this.findByUserNumberFromSRec({ userNumber });
    return sRec;
  }

  async addExpense({ userNumber, addExpenseDto }: IAddExpenseInput): Promise<Expense[]> {
    const addExpense = this.makeDate(addExpenseDto); // 년-월-일 합쳐진거 분리
    await this.createExpense({ userNumber, addExpense });
    const expense = await this.findByUserNumberFromExpense({ userNumber });
    return expense;
  }

  async deleteExpense({ userNumber, eNumber }: IDeleteExpenseInput): Promise<Expense[]> {
    this.checkDeleteReqNumber(eNumber, 'expenseNumber');
    await this.expenseRepository.delete({ user: { userNumber }, eNumber });
    const expense = await this.findByUserNumberFromExpense({ userNumber });
    return expense;
  }

  async addFixedExpense({
    userNumber,
    addFixedExpenseDto,
  }: IAddFixedExpenseInput): Promise<FixedExpense[]> {
    // 시작년월, 종료년월 합쳐진거 분리
    const { startDate, endDate, ...redData } = addFixedExpenseDto;
    const [startYear, startMonth] = this.splitDate(startDate);
    const [endYear, endMonth] = this.splitDate(endDate);
    if (startYear > endYear) throw new InternalServerErrorException('년도');
    const addFixedExpense = { startYear, startMonth, endYear, endMonth, ...redData };
    await this.createFixedExpense({ userNumber, addFixedExpense });
    const fixedExpense = await this.findByUserNumberFromFixedExpense({ userNumber });
    return fixedExpense;
  }

  async deleteFixedExpense({
    userNumber,
    feNumber,
  }: IDeleteFixedExpenseInput): Promise<FixedExpense[]> {
    this.checkDeleteReqNumber(feNumber, 'fixedExpenseNumber');
    await this.fixedExpenseRepository.delete({
      user: { userNumber },
      feNumber,
    });
    const fixedExpense = await this.findByUserNumberFromFixedExpense({ userNumber });
    return fixedExpense;
  }
}
