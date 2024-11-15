import { IOAuthUserData } from 'src/apis/01.Auth/interface/auth.interface';
import { UpdateMyInfoDto } from 'src/apis/02.User/dto/user-container.dto';
import { User } from 'src/apis/02.User/entity/user.entity';
import {
  AddExpenseDto,
  AddFixedExpenseDto,
  AddSolarDto,
  AddSRecDto,
} from 'src/apis/03.SPP/dto/spp-container.dto';

export interface MDIDate {
  date?: string;
}

export interface MDIBaseData {
  id?: number;
  user?: User;
  createdAt?: Date;
}

export interface MDIDeleteResult {
  raw?: any;
  affected?: number;
}

export interface MDIUpdateResult extends MDIDeleteResult {
  generatedMaps?: any;
}

export interface MDIOAuthUserData extends Partial<IOAuthUserData> {}

export interface MDIAuth {
  reqUser?: IOAuthUserData;
  id?: number;
  deletedAt?: Date | null;
}

export interface MDIToken {
  token?: string;
}

export interface MDISecret {
  secret?: string;
}

export interface MDIUserId {
  userId?: number;
}

export interface MDIDelId {
  delId?: number;
}

export interface MDIUpdateMyInfoDto extends Partial<UpdateMyInfoDto> {}
export interface MDIAddSolarDto extends Partial<AddSolarDto> {}
export interface MDIAddSRecDto extends Partial<AddSRecDto> {}
export interface MDIAddExpenseDto extends Partial<AddExpenseDto> {}
export interface MDIAddFixedExpenseDto extends Partial<AddFixedExpenseDto> {}
