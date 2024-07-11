import { BadRequestException, Injectable } from '@nestjs/common';
import {
  IAddSRecInput,
  IAddSolarInput,
  IDeleteSRecInput,
  IDeleteSolarInput,
  IFindOneByUidYearMonth,
} from './interfaces/spp-service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Solar } from './entities/solar.entity';
import { Repository } from 'typeorm';
import { UserService } from '../02.Users/user.service';
import { SRec } from './entities/sRec.entity';

@Injectable()
export class SppService {
  constructor(
    @InjectRepository(Solar)
    private readonly solarRepository: Repository<Solar>,
    @InjectRepository(SRec)
    private readonly sRecRepository: Repository<SRec>,
    private readonly userService: UserService,
  ) {}

  findByUserNumberFromSolar({ userNumber }) {
    return this.solarRepository.find({ where: { user: { userNumber } } });
  }

  findByUserNumberFromSRec({ userNumber }) {
    return this.sRecRepository.find({
      select: ['sRecNumber', 'year', 'month', 'day', 'sVolume', 'sPrice', 'createdAt'],
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

  createSolarData({ userNumber, addSolarData }): Promise<Solar> {
    return this.solarRepository.save({ user: { userNumber }, ...addSolarData });
  }

  createSRecData({ userNumber, addSRecData }): Promise<SRec> {
    return this.sRecRepository.save({ user: { userNumber }, ...addSRecData });
  }

  async fetchSppData({ userNumber }) {
    const user = await this.userService.findOneByUserNumberRelationed({ userNumber });
    const returnData = {
      solarData: user.solar,
      sRecData: user.sRec,
      fixedExpense: user.fixedExpense,
      expense: user.expense,
      kWh: user.kWh,
      recWeight: user.recWeight,
    };
    return returnData;
  }

  async addSolarData({ userNumber, addSolarDto }: IAddSolarInput): Promise<Solar[]> {
    // 년-월 합쳐진거 분리
    const { yearAndMonth, ...restAddSolarData } = addSolarDto;
    const [year, month] = yearAndMonth.split('-').map((part) => parseInt(part, 10));

    // year, month 중복 체크
    const result = await this.findOneByUserNumberYearMonthFromSolar({
      userNumber,
      year,
      month,
    });
    if (result) throw new BadRequestException('중복');

    const addSolarData = { year, month, ...restAddSolarData };
    await this.createSolarData({ userNumber, addSolarData });
    const solarData = await this.findByUserNumberFromSolar({ userNumber });
    return solarData;
  }

  async deleteSolarData({
    userNumber,
    deleteSolarDto,
  }: IDeleteSolarInput): Promise<Solar[]> {
    await this.solarRepository.delete({ user: { userNumber }, ...deleteSolarDto });
    const solarData = await this.findByUserNumberFromSolar({ userNumber });
    return solarData;
  }

  async addSRecData({ userNumber, addSRecDto }: IAddSRecInput): Promise<SRec[]> {
    // 년-월-일 합쳐진거 분리
    const { date, ...restAddSRecData } = addSRecDto;
    const [year, month, day] = date.split('-').map((part) => parseInt(part, 10));

    const addSRecData = { year, month, day, ...restAddSRecData };
    await this.createSRecData({ userNumber, addSRecData });
    const sRecData = await this.findByUserNumberFromSRec({ userNumber });
    return sRecData;
  }

  async deleteSRecData({ userNumber, deleteSRecDto }: IDeleteSRecInput): Promise<SRec[]> {
    await this.sRecRepository.delete({ user: { userNumber }, ...deleteSRecDto });
    const sRecData = await this.findByUserNumberFromSRec({ userNumber });
    return sRecData;
  }
}
