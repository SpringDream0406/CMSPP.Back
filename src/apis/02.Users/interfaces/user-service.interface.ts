import { reqUser } from 'src/apis/01.Auth/interfaces/auth.interface';
import { UpdateMyInfoDto } from '../dto/user-container.dto';
import { User } from '../entities/user.entity';

export interface IFindOneByUid {
  uid: string;
}

export interface IFindOneByBusinessNumber {
  businessNumber: string;
}

export interface IRfindOneByUserNumberForSpp
  extends Omit<User, 'auth' | 'businessNumber' | 'address' | 'createdAt'> {}

export interface IUpdateMyInfoInput extends reqUser {
  updateMyInfoDto: UpdateMyInfoDto;
}

export interface IRFindOneByUidForMyInfo
  extends Pick<User, 'kWh' | 'recWeight' | 'businessNumber' | 'address'> {}
