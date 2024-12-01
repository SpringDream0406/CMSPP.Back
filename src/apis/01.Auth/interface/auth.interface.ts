import { Response } from 'express';

// 회원가입 & 로그인
export interface IOAuthUserData {
  id: string;
  provider: string;
}
export interface IOAuthUser {
  user: IOAuthUserData;
}
export interface ISignUp {
  user: IOAuthUserData;
  res: Response;
}
// export interface ISignUp {
//   social: string;
//   code: string;
// }

// 일반 access
// export interface IAuthUser {
//   user?: {
//     userNumber: number;
//   };
// }

export interface userId {
  userId: number;
}

export interface IGetToken extends userId {
  isRefresh?: boolean;
}

export interface ISetRefreshToken extends userId {
  res: Response;
}
