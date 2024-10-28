import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { IStrategyPayload } from '../interfaces/strategy.interface';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { envKeys } from '../config/validation.schema';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: (req: Request) => {
        const cookie = req.headers.cookie;
        const refreshToken = cookie.replace('refreshToken=', '');
        return refreshToken;
      },
      secretOrKey: configService.get<string>(envKeys.refreshTokenSecret),
    });
  }

  validate(payload: IStrategyPayload) {
    // console.log(payload);

    return {
      userNumber: payload.sub,
    };
  }
}
