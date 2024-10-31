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
  IDeleteSppInput,
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
import { userId } from '../01.Auth/interfaces/auth.interface';

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

  findByUserNumberFromSolar({ userId }: userId): Promise<Solar[]> {
    return this.solarRepository.find({
      where: { user: { id: userId } },
      order: { date: 'ASC' },
    });
  }

  findByUserNumberFromSRec({ userId }: userId): Promise<SRec[]> {
    return this.sRecRepository.find({
      where: { user: { id: userId } },
      order: { date: 'ASC' },
    });
  }

  findByUserNumberFromExpense({ userId }: userId): Promise<Expense[]> {
    return this.expenseRepository.find({
      where: { user: { id: userId } },
      order: { date: 'ASC' },
    });
  }

  findByUserNumberFromFixedExpense({ userId }: userId): Promise<FixedExpense[]> {
    return this.fixedExpenseRepository.find({
      where: { user: { id: userId } },
      order: { startDate: 'ASC' },
    });
  }

  existsByUserNumberFromSolar({
    userId,
    date,
  }: IExistsByUserNumberFromSolar): Promise<boolean> {
    return this.solarRepository.exists({
      where: { user: { id: userId }, date },
    });
  }

  saveSolar({ userId, addSolarDto }: IAddSolarInput): Promise<Solar> {
    return this.solarRepository.save({ user: { id: userId }, ...addSolarDto });
  }

  saveSRec({ userId, addSRecDto }: IAddSRecInput): Promise<SRec> {
    return this.sRecRepository.save({ user: { id: userId }, ...addSRecDto });
  }

  saveExpense({ userId, addExpenseDto }: IAddExpenseInput) {
    return this.expenseRepository.save({ user: { id: userId }, ...addExpenseDto });
  }

  saveFixedExpense({ userId, addFixedExpenseDto }: IAddFixedExpenseInput) {
    return this.fixedExpenseRepository.save({
      user: { id: userId },
      ...addFixedExpenseDto,
    });
  }

  async fetchSpp({ userId }: userId): Promise<IRFetchSpp> {
    const user = await this.userService.findOneByUserNumberForSpp({ userId });
    delete user.id; // 유저번호 삭제해서 보내기
    return user;
  }

  async addSolar({ userId, addSolarDto }: IAddSolarInput): Promise<Solar[]> {
    const date = addSolarDto.date;
    // 중복 체크
    const result = await this.existsByUserNumberFromSolar({
      userId,
      date,
    });
    if (result) throw new BadRequestException('중복');
    await this.saveSolar({ userId, addSolarDto });
    const solar = await this.findByUserNumberFromSolar({ userId });
    return solar;
  }

  async deleteSolar({ userId, delId }: IDeleteSppInput): Promise<Solar[]> {
    await this.solarRepository.delete({ user: { id: userId }, id: delId });
    const solar = await this.findByUserNumberFromSolar({ userId });
    return solar;
  }

  async addSRec({ userId, addSRecDto }: IAddSRecInput): Promise<SRec[]> {
    await this.saveSRec({ userId, addSRecDto });
    const sRec = await this.findByUserNumberFromSRec({ userId });
    return sRec;
  }

  async deleteSRec({ userId, delId }: IDeleteSppInput): Promise<SRec[]> {
    await this.sRecRepository.delete({ user: { id: userId }, id: delId });
    const sRec = await this.findByUserNumberFromSRec({ userId });
    return sRec;
  }

  async addExpense({ userId, addExpenseDto }: IAddExpenseInput): Promise<Expense[]> {
    await this.saveExpense({ userId, addExpenseDto });
    const expense = await this.findByUserNumberFromExpense({ userId });
    return expense;
  }

  async deleteExpense({ userId, delId }: IDeleteSppInput): Promise<Expense[]> {
    await this.expenseRepository.delete({ user: { id: userId }, id: delId });
    const expense = await this.findByUserNumberFromExpense({ userId });
    return expense;
  }

  async addFixedExpense({
    userId,
    addFixedExpenseDto,
  }: IAddFixedExpenseInput): Promise<FixedExpense[]> {
    const startDate = addFixedExpenseDto.startDate;
    const endDate = addFixedExpenseDto.endDate;
    if (startDate > endDate) throw new InternalServerErrorException('년도');
    await this.saveFixedExpense({ userId, addFixedExpenseDto });
    const fixedExpense = await this.findByUserNumberFromFixedExpense({ userId });
    return fixedExpense;
  }

  async deleteFixedExpense({ userId, delId }: IDeleteSppInput): Promise<FixedExpense[]> {
    await this.fixedExpenseRepository.delete({
      user: { id: userId },
      id: delId,
    });
    const fixedExpense = await this.findByUserNumberFromFixedExpense({ userId });
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
