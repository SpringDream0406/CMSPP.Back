import { userId } from 'src/apis/01.Auth/interface/auth.interface';
import { UpdateMyInfoDto } from '../dto/user-container.dto';
import { User } from '../entity/user.entity';

export interface IFindOneByUid {
  uid: string;
}

export interface IFindOneByBusinessNumber {
  businessNumber: string;
}

export interface IRfindOneByUserIdForSpp
  extends Omit<User, 'auth' | 'businessNumber' | 'address' | 'createdAt'> {}

export interface IUpdateMyInfoInput extends userId {
  updateMyInfoDto: UpdateMyInfoDto;
}
