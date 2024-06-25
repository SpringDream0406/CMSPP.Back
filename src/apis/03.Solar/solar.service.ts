import { BadRequestException, Injectable } from '@nestjs/common';
import {
  IAddSolarInput,
  IFindOneByUidYearMonth,
} from './interfaces/solar-service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Solar } from './entities/solar.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SolarService {
  constructor(
    @InjectRepository(Solar)
    private readonly solarRepository: Repository<Solar>,
  ) {}

  findOneByUidYearMonth({ uid, year, month }: IFindOneByUidYearMonth): Promise<Solar> {
    return this.solarRepository.findOne({
      where: { userUid: uid, year, month },
    });
  }

  create({ uid, addSolarData }): Promise<Solar> {
    return this.solarRepository.save({ userUid: uid, ...addSolarData });
  }

  async addSolarData({ uid, addSolarDto }: IAddSolarInput): Promise<{ message: string }> {
    // 년-월 합쳐진거 분리
    const { yearAndMonth, ...restAddSolarData } = addSolarDto;
    const [year, month] = yearAndMonth.split('-').map((part) => parseInt(part, 10));

    // year, month 중복 체크
    const result = await this.findOneByUidYearMonth({ uid, year, month });
    if (result) throw new BadRequestException('중복');

    const addSolarData = { year, month, ...restAddSolarData };
    await this.create({ uid, addSolarData });
    return { message: '성공' };
  }
}
