import { BadRequestException, Injectable } from '@nestjs/common';
import {
  IAddSolarInput,
  IDeleteSolarInput,
  IFindOneByUidYearMonth,
} from './interfaces/spp-service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Solar } from './entities/solar.entity';
import { Repository } from 'typeorm';
import { UserService } from '../02.Users/user.service';
import { Rec } from './entities/rec.entity';

@Injectable()
export class SppService {
  constructor(
    @InjectRepository(Solar)
    private readonly solarRepository: Repository<Solar>,
    @InjectRepository(Rec)
    private readonly recRepository: Repository<Rec>,
    private readonly userService: UserService,
  ) {}

  findByUidFromSolar({ uid }) {
    return this.solarRepository.find({ where: { userUid: uid }, relations: ['user'] });
  }

  findOneByUidYearMonth({ uid, year, month }: IFindOneByUidYearMonth): Promise<Solar> {
    return this.solarRepository.findOne({
      where: { userUid: uid, year, month },
    });
  }

  create({ uid, addSolarData }): Promise<Solar> {
    return this.solarRepository.save({ userUid: uid, ...addSolarData });
  }

  async fetchSppData({ uid }) {
    const user = await this.userService.findOneByUid({ uid });
    // console.log(user);
    const response = {
      solar: user.solar,
      rec: user.rec,
      fixedExpense: user.fixedExpense,
      expense: user.expense,
    };
    return response;
  }

  // async fetchSolarData({ uid }) {
  //   const result = await this.findByUidFromSolar({ uid });
  // }

  async addSolarData({ uid, addSolarDto }: IAddSolarInput): Promise<Solar[]> {
    // console.log(addSolarDto);
    // 년-월 합쳐진거 분리
    const { yearAndMonth, ...restAddSolarData } = addSolarDto;
    const [year, month] = yearAndMonth.split('-').map((part) => parseInt(part, 10));

    // year, month 중복 체크
    const result = await this.findOneByUidYearMonth({ uid, year, month });
    if (result) throw new BadRequestException('중복');

    const addSolarData = { year, month, ...restAddSolarData };
    await this.create({ uid, addSolarData });
    const solarData = await this.findByUidFromSolar({ uid });
    // console.log(solarData);
    return solarData;
  }

  async deletedSolarData({ uid, deleteSolarDto }: IDeleteSolarInput): Promise<Solar[]> {
    await this.solarRepository.delete({ userUid: uid, ...deleteSolarDto });
    const solarData = await this.findByUidFromSolar({ uid });
    return solarData;
  }
}
