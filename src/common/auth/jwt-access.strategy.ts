import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IStrategyPayload } from '../interfaces/strategy.interface';
import { ConfigService } from '@nestjs/config';
import { envKeys } from '../validation.schema';

export class JwtAccessStrategy extends PassportStrategy(Strategy, 'access') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>(envKeys.accessTokenSecret),
    });
  }

  validate(payload: IStrategyPayload) {
    // console.log(payload);

    return {
      userNumber: payload.sub,
    };
  }
}
