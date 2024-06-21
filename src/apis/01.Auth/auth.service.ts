import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Auth } from './entities/auth.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IAuthServiceGetAccessToken,
  IAuthServiceSetRefreshToken,
  IAuthServiceSignUp,
  IAuthServiceUid,
  IOAuthUser,
} from './interface/auth.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../02.Users/entities/user.service';
import { User } from '../02.Users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly dataSource: DataSource,
  ) {}

  findOne({ user }: IOAuthUser): Promise<Auth> {
    return this.authRepository.findOne({
      where: { id: user.id, provider: user.provider },
    });
  }

  findOneByUid({ uid }: IAuthServiceUid) {
    return this.authRepository.findOne({
      where: { uid },
    });
  }

  async create({ user }: IOAuthUser): Promise<Auth> {
    const queyRunner = this.dataSource.createQueryRunner();
    await queyRunner.connect();
    await queyRunner.startTransaction();
    try {
      const auth = await queyRunner.manager.save(Auth, { ...user });
      await queyRunner.manager.save(User, {
        authUid: auth.uid,
      });
      await queyRunner.commitTransaction();
      return auth;
    } catch (error) {
      //   console.log(error);
      await queyRunner.rollbackTransaction();
      throw new InternalServerErrorException('회원 가입 실패(DB)');
    } finally {
      queyRunner.release();
    }
  }

  getAccessToken({ uid }: IAuthServiceGetAccessToken): string {
    return this.jwtService.sign(
      { sub: uid },
      {
        secret: this.configService.get('ACCESSTOKEN_SECRET'),
        expiresIn: '15m',
      },
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

  // 로그인/회원가입
  async signUp({ user, res }: IAuthServiceSignUp): Promise<string> {
    let auth = await this.findOne({ user });
    if (!auth) auth = await this.create({ user });
    const uid = auth.uid;
    this.setRefreshToken({ uid, res });
    return auth.uid;
  }

  // 회원탈퇴
  withdrawal({ uid }: IAuthServiceUid) {
    return this.authRepository.softDelete({ uid });
  }
}
