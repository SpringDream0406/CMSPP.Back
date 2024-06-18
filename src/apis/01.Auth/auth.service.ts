import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Auth } from './entities/auth.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IAuthServiceGetAccessToken,
  IAuthServiceSetRefreshToken,
  IAuthServiceSignUp,
  IOAuthUser,
} from './interface/auth.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  findOne({ user }: IOAuthUser): Promise<Auth> {
    return this.authRepository.findOne({
      where: { id: user.id, provider: user.provider },
    });
  }

  create({ user }: IOAuthUser): Promise<Auth> {
    return this.authRepository.save({
      ...user,
    });
  }

  getAccessToken({ uid }: IAuthServiceGetAccessToken): string {
    return this.jwtService.sign(
      { sub: uid },
      { secret: this.configService.get('ACCESSTOKEN_SECRET'), expiresIn: '1h' },
    );
  }

  setRefreshToken({ uid, res }: IAuthServiceSetRefreshToken): void {
    const refreshToken = this.jwtService.sign(
      { sub: uid },
      {
        secret: this.configService.get('REFRESHTOKEN_SECRET'),
        expiresIn: '1w',
      },
    );

    // 개발환경
    res.setHeader('set-Cookie', `refreshToken=${refreshToken}; path=/;`);

    // 배포환경
    // res.setHeader(
    //   'set-Cookie',
    //   `refreshToken=${refreshToken}; path=/; domain=.도메인주소; SameSite=None; Secure; httpOnly`,
    // );
    // res.setHeader('Access-Control-Allow-Origin', 'https://프론트주소');
  }

  async signUp({ user, res }: IAuthServiceSignUp): Promise<string> {
    console.log(user);

    let auth = await this.findOne({ user });
    if (!auth) auth = await this.create({ user });
    const uid = auth.uid;
    this.setRefreshToken({ uid, res });
    return auth.uid;
  }
}
