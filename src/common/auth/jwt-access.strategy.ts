import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IStrategyPayload } from '../interfaces/strategy.interface';
import { ConfigService } from '@nestjs/config';

export class JwtAccessStrategy extends PassportStrategy(Strategy, 'access') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('ACCESSTOKEN_SECRET'),
    });
  }

  validate(payload: IStrategyPayload) {
    // console.log(payload);

    return {
      userNumber: payload.sub,
    };
  }
}
