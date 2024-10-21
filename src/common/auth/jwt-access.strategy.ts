import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IStrategyPayload } from '../interfaces/strategy.interface';

export class JwtAccessStrategy extends PassportStrategy(Strategy, 'access') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.ACCESSTOKEN_SECRET,
    });
  }

  validate(payload: IStrategyPayload) {
    // console.log(payload);

    return {
      userNumber: payload.sub,
    };
  }
}
