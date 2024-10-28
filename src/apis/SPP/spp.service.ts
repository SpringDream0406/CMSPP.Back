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
  IDeleteExpenseInput,
  IDeleteFixedExpenseInput,
  IDeleteSRecInput,
  IDeleteSolarInput,
  IExistsByUserNumberFromSolar,
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
      order: { date: 'ASC' },
    });
  }

  findByUserNumberFromSRec({ userNumber }: reqUser): Promise<SRec[]> {
    return this.sRecRepository.find({
      where: { user: { userNumber } },
      order: { date: 'ASC' },
    });
  }

  findByUserNumberFromExpense({ userNumber }: reqUser): Promise<Expense[]> {
    return this.expenseRepository.find({
      where: { user: { userNumber } },
      order: { date: 'ASC' },
    });
  }

  findByUserNumberFromFixedExpense({ userNumber }: reqUser): Promise<FixedExpense[]> {
    return this.fixedExpenseRepository.find({
      where: { user: { userNumber } },
      order: { startDate: 'ASC' },
    });
  }

  existsByUserNumberFromSolar({
    userNumber,
    date,
  }: IExistsByUserNumberFromSolar): Promise<boolean> {
    return this.solarRepository.exists({
      where: { user: { userNumber }, date },
    });
  }

  saveSolar({ userNumber, addSolarDto }: IAddSolarInput): Promise<Solar> {
    return this.solarRepository.save({ user: { userNumber }, ...addSolarDto });
  }

  saveSRec({ userNumber, addSRecDto }: IAddSRecInput): Promise<SRec> {
    return this.sRecRepository.save({ user: { userNumber }, ...addSRecDto });
  }

  saveExpense({ userNumber, addExpenseDto }: IAddExpenseInput) {
    return this.expenseRepository.save({ user: { userNumber }, ...addExpenseDto });
  }

  saveFixedExpense({ userNumber, addFixedExpenseDto }: IAddFixedExpenseInput) {
    return this.fixedExpenseRepository.save({
      user: { userNumber },
      ...addFixedExpenseDto,
    });
  }

  async fetchSpp({ userNumber }: reqUser): Promise<IRFetchSpp> {
    const user = await this.userService.findOneByUserNumberForSpp({ userNumber });
    delete user.userNumber; // 유저번호 삭제해서 보내기
    return user;
  }

  async addSolar({ userNumber, addSolarDto }: IAddSolarInput): Promise<Solar[]> {
    const date = addSolarDto.date;
    // 중복 체크
    const result = await this.existsByUserNumberFromSolar({
      userNumber,
      date,
    });
    if (result) throw new BadRequestException('중복');
    await this.saveSolar({ userNumber, addSolarDto });
    const solar = await this.findByUserNumberFromSolar({ userNumber });
    return solar;
  }

  async deleteSolar({ userNumber, solarNumber }: IDeleteSolarInput): Promise<Solar[]> {
    await this.solarRepository.delete({ user: { userNumber }, solarNumber });
    const solar = await this.findByUserNumberFromSolar({ userNumber });
    return solar;
  }

  async addSRec({ userNumber, addSRecDto }: IAddSRecInput): Promise<SRec[]> {
    await this.saveSRec({ userNumber, addSRecDto });
    const sRec = await this.findByUserNumberFromSRec({ userNumber });
    return sRec;
  }

  async deleteSRec({ userNumber, sRecNumber }: IDeleteSRecInput): Promise<SRec[]> {
    await this.sRecRepository.delete({ user: { userNumber }, sRecNumber });
    const sRec = await this.findByUserNumberFromSRec({ userNumber });
    return sRec;
  }

  async addExpense({ userNumber, addExpenseDto }: IAddExpenseInput): Promise<Expense[]> {
    await this.saveExpense({ userNumber, addExpenseDto });
    const expense = await this.findByUserNumberFromExpense({ userNumber });
    return expense;
  }

  async deleteExpense({ userNumber, eNumber }: IDeleteExpenseInput): Promise<Expense[]> {
    console.log(eNumber);

    await this.expenseRepository.delete({ user: { userNumber }, eNumber });
    const expense = await this.findByUserNumberFromExpense({ userNumber });
    return expense;
  }

  async addFixedExpense({
    userNumber,
    addFixedExpenseDto,
  }: IAddFixedExpenseInput): Promise<FixedExpense[]> {
    const startDate = addFixedExpenseDto.startDate;
    const endDate = addFixedExpenseDto.endDate;
    if (startDate > endDate) throw new InternalServerErrorException('년도');
    await this.saveFixedExpense({ userNumber, addFixedExpenseDto });
    const fixedExpense = await this.findByUserNumberFromFixedExpense({ userNumber });
    return fixedExpense;
  }

  async deleteFixedExpense({
    userNumber,
    feNumber,
  }: IDeleteFixedExpenseInput): Promise<FixedExpense[]> {
    await this.fixedExpenseRepository.delete({
      user: { userNumber },
      feNumber,
    });
    const fixedExpense = await this.findByUserNumberFromFixedExpense({ userNumber });
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
