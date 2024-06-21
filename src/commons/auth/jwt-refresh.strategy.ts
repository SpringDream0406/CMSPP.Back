import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { IStrategyPayload } from '../interfaces/strategy.interface';
import { Request } from 'express';

export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor() {
    super({
      jwtFromRequest: (req: Request) => {
        const cookie = req.headers.cookie;
        const refreshToken = cookie.replace('refreshToken=', '');
        return refreshToken;
      },
      secretOrKey: process.env.REFRESHTOKEN_SECRET,
    });
  }

  validate(payload: IStrategyPayload) {
    // console.log(payload);

    return {
      uid: payload.sub,
    };
  }
}
