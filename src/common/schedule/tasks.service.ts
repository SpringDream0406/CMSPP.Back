import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/apis/02.User/entity/user.entity';
import { LessThan, Repository } from 'typeorm';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // 회원탈퇴 7일 이상인 사용자 정보 전체 삭제
  @Cron('* * 1 * * *') // 매일 01:00
  async removeSoftDeletedUsers(): Promise<void> {
    const before7days = new Date();
    before7days.setDate(before7days.getDate() - 7);

    await this.userRepository.delete({
      deletedAt: LessThan(before7days),
    });
  }
}
