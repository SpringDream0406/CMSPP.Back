import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-naver-v2';

export class JwtNaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('SOCIAL_NAVER_ID'),
      clientSecret: configService.get<string>('SOCIAL_NAVER_SECRET'),
      callbackURL: `${configService.get<string>('SOCIAL_CALLBACK_URL')}/naver`,
      // scope: ['email'],
    });
  }

  validate(accessToken: string, refreshToken: string, profile: Profile) {
    // console.log(profile);

    return {
      id: profile.id,
      provider: profile.provider,
    };
  }
}
