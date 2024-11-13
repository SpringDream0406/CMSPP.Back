import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Auth } from './entity/auth.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IOAuthUser,
  ISetRefreshToken,
  ISignUp,
  userId,
} from './interface/auth.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { envKeys } from 'src/common/config/validation.schema';
import { Role } from '../02.User/entity/user.entity';
import { UserService } from '../02.User/user.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource, // 쿼리러너
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

  /* istanbul ignore next */
  /** 만료된 엑세스토큰 발급__  */
  getExpiredAccessToken({ userId }: userId): string {
    return this.jwtService.sign(
      { sub: userId },
      {
        secret: this.configService.get<string>(envKeys.accessTokenSecret),
        expiresIn: -1,
      },
    );
  }

  /** 엑세스토큰 발급__  */
  getAccessToken({ userId }: userId): string {
    return this.jwtService.sign(
      { sub: userId },
      {
        secret: this.configService.get<string>(envKeys.accessTokenSecret),
        expiresIn: '15m',
      },
    );
  }

  /* istanbul ignore next */
  /** 만료된 리프래시토큰 발급__ e2e 테스트용 */
  getExpiredRefreshToken({ userId }: userId): string {
    return this.jwtService.sign(
      { sub: userId },
      {
        secret: this.configService.get<string>(envKeys.refreshTokenSecret),
        expiresIn: -1,
      },
    );
  }

  /** 리프래시토큰 발급__ */
  getRefreshToken({ userId }: userId): string {
    return this.jwtService.sign(
      { sub: userId },
      {
        secret: this.configService.get<string>(envKeys.refreshTokenSecret),
        expiresIn: '24h',
      },
    );
  }

  /** 리프래시토큰 세팅__ */
  setRefreshToken({ userId, res }: ISetRefreshToken): void {
    const refreshToken = this.getRefreshToken({ userId });
    const env = this.configService.get(envKeys.env);

    // 개발/테스트
    if (env === 'dev' || env === 'test') {
      res.setHeader('set-Cookie', `refreshToken=${refreshToken}; path=/;`);
    } else {
      // 배포
      // res.setHeader(
      //   'set-Cookie',
      //   `refreshToken=${refreshToken}; path=/; domain=.도메인주소; SameSite=None; Secure; httpOnly`,
      // );
      // res.setHeader('Access-Control-Allow-Origin', 'https://프론트주소');
    }
  }
}
