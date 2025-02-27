import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { envKeys } from '../config/validation.schema';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtGoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>(envKeys.socialGoogleId),
      clientSecret: configService.get<string>(envKeys.socialGoogleSecet),
      callbackURL: `${configService.get<string>(envKeys.socialCallBackURL)}/google`,
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
