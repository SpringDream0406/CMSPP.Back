import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-kakao';

export class JwtKakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor() {
    super({
      clientID: process.env.SOCIAL_KAKAO_ID,
      clientSecret: process.env.SOCIAL_KAKAO_SECRET,
      callbackURL: `${process.env.SOCIAL_CALLBACK_URL}/kakao`,
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
