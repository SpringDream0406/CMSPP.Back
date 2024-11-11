import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from 'src/apis/01.Auth/entity/auth.entity';
import { User } from 'src/apis/02.User/entity/user.entity';
import { LessThan, Repository } from 'typeorm';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>, //
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  private readonly logger = new Logger(TasksService.name);

  // 회원탈퇴 7일 이상인 사용자 정보 전체 삭제
  @Cron('* * 1 * * *') // 매일 01:00
  async removeSoftDeletedUsers() {
    const before7days = new Date();
    before7days.setDate(before7days.getDate() - 7);

    const softDeletedUsers = await this.authRepository.find({
      where: { deletedAt: LessThan(before7days) },
      select: ['user'],
      relations: ['user'],
      withDeleted: true,
    });

    await this.userRepository.remove(softDeletedUsers.map((auth) => auth.user));
  }
}
