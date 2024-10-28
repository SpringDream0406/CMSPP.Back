import { BadRequestException, Injectable } from '@nestjs/common';
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
import { envKeys } from 'src/common/config/validation.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource, // 쿼리러너
  ) {}

  // 회원 유무조회, 데이터 써야되므로 exists 말고 findOne
  findOneByUserFromAuth({ user }: IOAuthUser): Promise<Auth> {
    return this.authRepository.findOne({
      where: { ...user },
      relations: ['user'],
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
  //       user: { userNumber: userData.userNumber },
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

  // 회원 추가
  async saveUser({ user }: IOAuthUser): Promise<Auth> {
    const auth = await this.authRepository.save({
      ...user,
      user: { recWeight: 1.0 },
    });
    return auth;
  }

  // 로그인/회원가입
  async signUp({ user, res }: IAuthServiceSignUp): Promise<void> {
    let auth = await this.findOneByUserFromAuth({ user });
    if (!auth) auth = await this.saveUser({ user });
    const userNumber = auth.user.userNumber;
    this.setRefreshToken({ userNumber, res });
  }

  // 회원탈퇴
  async withdrawal({ userNumber }: reqUser): Promise<DeleteResult> {
    const result = await this.authRepository.softDelete({ user: { userNumber } });
    if (result.affected === 0) throw new BadRequestException('탈퇴 실패 DB');
    return result;
  }

  // 엑세스토큰 발급
  getAccessToken({ userNumber }: reqUser): string {
    return this.jwtService.sign(
      { sub: userNumber },
      {
        secret: this.configService.get<string>(envKeys.accessTokenSecret),
        expiresIn: '15m',
      },
    );
  }

  // 리프래시토큰 발급
  setRefreshToken({ userNumber, res }: IAuthServiceSetRefreshToken): void {
    const refreshToken = this.jwtService.sign(
      { sub: userNumber },
      {
        secret: this.configService.get<string>(envKeys.refreshTokenSecret),
        expiresIn: '24h',
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
