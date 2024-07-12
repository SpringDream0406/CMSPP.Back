import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource, DeleteResult, Repository } from 'typeorm';
import { Auth } from './entities/auth.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IAuthServiceSetRefreshToken,
  IAuthServiceSignUp,
  IOAuthUser,
  reqUser,
} from './interfaces/auth.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../02.Users/user.service';
import { User } from '../02.Users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService, // env
    private readonly userService: UserService,
    private readonly dataSource: DataSource, // 쿼리러너
  ) {}

  // 회원 유무조회
  findOneFromAuth({ user }: IOAuthUser): Promise<Auth> {
    return this.authRepository.findOne({
      where: { ...user },
    });
  }

  // 회원 추가
  async create({ user }: IOAuthUser): Promise<Auth> {
    const queyRunner = this.dataSource.createQueryRunner();
    await queyRunner.connect();
    await queyRunner.startTransaction();
    try {
      const auth = await queyRunner.manager.save(Auth, { ...user });
      await queyRunner.manager.save(User, { auth });
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

  // 로그인/회원가입
  async signUp({ user, res }: IAuthServiceSignUp): Promise<number> {
    let auth = await this.findOneFromAuth({ user });
    if (!auth) auth = await this.create({ user });
    const { userNumber } = await this.userService.findOneByUid({ uid: auth.uid });
    this.setRefreshToken({ userNumber, res });
    return userNumber;
  }

  // 회원탈퇴
  async withdrawal({ userNumber }: reqUser): Promise<DeleteResult> {
    const user = await this.userService.findOneByUserNumber({ userNumber });
    console.log(user);

    return this.authRepository.softDelete({ ...user.auth });
  }

  // 엑세스토큰 발급
  getAccessToken({ userNumber }: reqUser): string {
    return this.jwtService.sign(
      { sub: userNumber },
      {
        secret: this.configService.get('ACCESSTOKEN_SECRET'),
        expiresIn: '15m',
      },
    );
  }

  // 리프래시토큰 발급
  setRefreshToken({ userNumber, res }: IAuthServiceSetRefreshToken): void {
    const refreshToken = this.jwtService.sign(
      { sub: userNumber },
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
}
