import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userReposityory: Repository<User>,
  ) {}

  findOneByUid({ uid }): Promise<User> {
    return this.userReposityory.findOne({
      where: { authUid: uid },
      relations: ['solar'],
    });
  }
}
