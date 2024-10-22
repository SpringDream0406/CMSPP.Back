import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';

export class JwtGoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('SOCIAL_GOOGLE_ID'),
      clientSecret: configService.get<string>('SOCIAL_GOOGLE_SECRET'),
      callbackURL: `${configService.get<string>('SOCIAL_CALLBACK_URL')}/google`,
      scope: ['email'],
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
