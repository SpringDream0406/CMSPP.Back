import { Response } from 'express';

interface IOAuthUserData {
  id: string;
  provider: string;
}

export interface IOAuthUser {
  user: IOAuthUserData;
}

export interface IAuthUser {
  user?: {
    uid: string;
  };
}

export interface IAuthServiceSignUp {
  user: IOAuthUserData;
  res: Response;
}

export interface IAuthServiceSetRefreshToken {
  uid: string;
  res: Response;
}

export interface IAuthServiceGetAccessToken {
  uid: string;
}

export interface IAuthServiceUid {
  uid: string;
}
