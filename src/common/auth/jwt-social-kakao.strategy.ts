import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-kakao';

export class JwtKakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('SOCIAL_KAKAO_ID'),
      clientSecret: configService.get<string>('SOCIAL_KAKAO_SECRET'),
      callbackURL: `${configService.get<string>('SOCIAL_CALLBACK_URL')}/kakao`,
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
