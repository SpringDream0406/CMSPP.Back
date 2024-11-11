import { PickType } from '@nestjs/swagger';
import { User } from '../entity/user.entity';

export class UpdateMyInfoDto extends PickType(User, [
  'kWh',
  'recWeight',
  'businessNumber',
  'address',
]) {}
