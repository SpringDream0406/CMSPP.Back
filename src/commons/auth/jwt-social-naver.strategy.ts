import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-naver-v2';

export class JwtNaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor() {
    super({
      clientID: process.env.SOCIAL_NAVER_ID,
      clientSecret: process.env.SOCIAL_NAVER_SECRET,
      callbackURL: `${process.env.SOCIAL_CALLBACK_URL}/naver`,
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
