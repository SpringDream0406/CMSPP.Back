import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Auth } from './entity/auth.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IGetToken,
  IOAuthUser,
  ISetRefreshToken,
  ISignUp,
} from './interface/auth.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { envKeys } from 'src/common/config/validation.schema';
import { Role } from '../02.User/entity/user.entity';
import { UserService } from '../02.User/user.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
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

  // 회원 추가
  // async saveUser({ user }: IOAuthUser): Promise<Auth> {
  //   const queyRunner = this.dataSource.createQueryRunner();
  //   await queyRunner.connect();
  //   await queyRunner.startTransaction();
  //   try {
  //     const userData = await queyRunner.manager.save(User, { recWeight: 1.0 });
  //     const auth = await queyRunner.manager.save(Auth, {
  //       ...user,
  //       user: { id: userData.id },
  //     });
  //     await queyRunner.commitTransaction();
  //     return auth;
  //   } catch (error) {
  //     //   console.log(error);
  //     await queyRunner.rollbackTransaction();
  //     throw new InternalServerErrorException('회원 가입 실패(DB)');
  //   } finally {
  //     queyRunner.release();
  //   }
  // }

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
    this.setRefreshToken({ userId, res });
  }

  // // /** 로그인/회원가입__ Auth에서 검색해보고 없으면 회원가입 후 userId 쿠키에 넣기 */
  // async signUp({ social, code }: ISignUp): Promise<void> {
  //   console.log(social, code);

  //   const googleTokenURL = 'https://oauth2.googleapis.com/token';
  //   const googleClientId = this.configService.getOrThrow<string>(envKeys.socailGoogleId);
  //   const googleClientSecret = this.configService.getOrThrow<string>(
  //     envKeys.socailGoogleSecet,
  //   );
  //   const googleRedirectURI = 'http://localhost:3009/signup/google';
  //   try {
  //     const tokenResponse = await axios.post(googleTokenURL, null, {
  //       params: {
  //         code,
  //         client_id: googleClientId,
  //         client_secret: googleClientSecret,
  //         redirect_uri: googleRedirectURI,
  //         grant_type: 'authorization_code',
  //       },
  //     });
  //     console.log(tokenResponse);
  //   } catch (error) {
  //     console.log(error);
  //   }

  //   let auth = await this.findOneByUserFromAuth({ user });
  //   if (auth && auth.user.deletedAt) {
  //     await this.userService.restoreUser(auth);
  //   }
  //   if (!auth) {
  //     auth = await this.saveUser({ user });
  //   }
  //   const userId = auth.user.id;
  //   this.setRefreshToken({ userId, res });
  // }

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

  /** 리프래시토큰 세팅__ */
  setRefreshToken({ userId, res }: ISetRefreshToken): void {
    const refreshToken = this.getToken({ userId, isRefresh: true });
    const env = this.configService.getOrThrow(envKeys.env);

    // 개발/테스트
    if (env === 'dev' || env === 'test') {
      res.setHeader('set-Cookie', `refreshToken=${refreshToken}; path=/;`);
    } else {
      // 배포
      res.setHeader(
        'set-Cookie',
        `refreshToken=${refreshToken}; path=/; domain=.cmspp.kr; SameSite=None; Secure; httpOnly`,
      );
      res.setHeader('Access-Control-Allow-Origin', 'https://cmspp.kr/');
    }

    // // 개발/테스트
    // if (env === 'dev' || env === 'test') {
    //   res.cookie('refreshToken', refreshToken, {
    //     path: '/',
    //   });
    // } else {
    //   res.cookie('refreshToken', refreshToken, {
    //     path: '/',
    //     domain: '.cmspp.store',
    //     sameSite: 'none',
    //     secure: true,
    //     httpOnly: true,
    //   });

    //   res.setHeader('Access-Control-Allow-Origin', 'https://cmspp.kr');
    //   res.setHeader('Access-Control-Allow-Credentials', 'true');
    // }
  }
}
