import { Response } from 'express';

// 회원가입 & 로그인
interface IOAuthUserData {
  id: string;
  provider: string;
}
export interface IOAuthUser {
  user: IOAuthUserData;
}
export interface IAuthServiceSignUp {
  user: IOAuthUserData;
  res: Response;
}

// 일반 access
export interface IAuthUser {
  user?: {
    userNumber: number;
  };
}

export interface reqUser {
  userNumber: number;
}

export interface IAuthServiceSetRefreshToken extends reqUser {
  res: Response;
}
