import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Auth } from './entity/auth.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IGetToken, IOAuthUser, ISetCookie, ISignUp } from './interface/auth.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { envKeys } from 'src/common/config/validation.schema';
import { Role } from '../02.User/entity/user.entity';
import { UserService } from '../02.User/user.service';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /* istanbul ignore next */
  /** 회원 유무조회__ 데이터 써야되므로 exists 말고 findOne */
  findOneByUserFromAuth({ user }: IOAuthUser): Promise<Auth> {
    return this.authRepository.findOne({
      select: { user: { id: true, deletedAt: true } },
      where: { ...user },
      relations: { user: true },
      withDeleted: true,
    });
  }

  /* istanbul ignore next */
  /** 회원 추가__ User에 role 넣어주면서 Auth와 관계설정 */
  saveUser({ user }: IOAuthUser): Promise<Auth> {
    return this.authRepository.save({
      ...user,
      user: { role: Role.USER },
    });
  }

  /** 로그인/회원가입__ Auth에서 검색해보고 없으면 회원가입 후 userId 쿠키에 넣기 */
  async signUp({ user, res }: ISignUp): Promise<void> {
    let auth = await this.findOneByUserFromAuth({ user });

    if (auth && auth.user.deletedAt) {
      await this.userService.restoreUser(auth);
    }
    if (!auth) {
      auth = await this.saveUser({ user });
    }
    const userId = auth.user.id;
    this.setCookie({ userId, res });
  }

  /* istanbul ignore next */
  /** 만료된 토큰 발급__ e2e Test */
  getExpiredToken({ userId, isRefresh = false }: IGetToken): string {
    const secret = this.configService.getOrThrow<string>(
      isRefresh ? envKeys.refreshTokenSecret : envKeys.accessTokenSecret,
    );
    const token = this.jwtService.sign(
      { sub: userId },
      {
        secret,
        expiresIn: -1,
      },
    );
    return token;
  }

  getToken({ userId, isRefresh = false }: IGetToken): string {
    const secret = this.configService.getOrThrow<string>(
      isRefresh ? envKeys.refreshTokenSecret : envKeys.accessTokenSecret,
    );
    const token = this.jwtService.sign(
      { sub: userId },
      {
        secret,
        expiresIn: isRefresh ? '24h' : '15m',
      },
    );
    return token;
  }

  /** 쿠키 세팅__ */
  setCookie({ userId, res }: ISetCookie): void {
    const refreshToken = this.getToken({ userId, isRefresh: true });
    const isProd = this.configService.getOrThrow(envKeys.env) === 'prod';

    // 배포
    if (isProd) {
      res.cookie('refreshToken', refreshToken, {
        path: '/',
        domain: '.cmspp.kr',
        sameSite: 'none',
        secure: true,
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24시간
      });
      res.setHeader(
        'Access-Control-Allow-Origin',
        `${this.configService.getOrThrow<string>(envKeys.frontURL)}`,
      );
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else {
      // 그외
      res.cookie('refreshToken', refreshToken, {
        path: '/',
        expires: new Date(Date.now() + 1000 * 60 * 1), // 1분
      });
    }
  }

  // 로그아웃
  logOut(res: Response) {
    const isProd = this.configService.getOrThrow(envKeys.env) === 'prod';
    res.clearCookie(
      'refreshToken',
      isProd
        ? {
            path: '/',
            domain: '.cmspp.kr',
            sameSite: 'none',
            secure: true,
            httpOnly: true,
          }
        : {},
    );
  }
}
