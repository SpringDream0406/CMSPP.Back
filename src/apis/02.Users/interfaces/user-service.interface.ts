import { UpdateMyInfoDto } from '../dto/user-container.dto';
import { User } from '../entities/user.entity';

export interface IUpdateMyInfoInput {
  userNumber: number;
  updateMyInfoDto: UpdateMyInfoDto;
}

export interface IFindOneByUidForMyInfo
  extends Pick<User, 'kWh' | 'recWeight' | 'businessNumber'> {}
