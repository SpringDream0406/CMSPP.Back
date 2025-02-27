import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { envKeys } from './config/validation.schema';
import {
  IGetMetaData,
  IReturnToken,
  IValidateToken,
} from './interface/common.service.interface';

@Injectable()
export class CommonService {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /* istanbul ignore next */
  /** 데코이용 메타데이터 가져옴 */
  getMetaData<T>({ decorator, context }: IGetMetaData): T | undefined {
    return this.reflector.get<T>(decorator, context.getHandler());
  }

  /** 쿠키에서 refreshToken 가져오기 문제 있으면 false 반환 */
  parseRefreshToken(req: Request): string | boolean {
    const cookie = req.headers.cookie;
    if (!cookie) {
      return false;
    }
    const [auth, refreshToken] = cookie.split('=');
    if (auth?.toLowerCase() != 'refreshtoken' || !refreshToken) {
      return false;
    }
    return refreshToken;
  }

  /** Bearer에서 token 가져오는데, 해당 서비스는 accessToken만 담기때문에 accessToken 가져오기, 문제있으면 false 반환 */
  parseAccessToken(req: Request): string | boolean {
    const authorization = req.headers.authorization;
    if (!authorization) {
      return false;
    }
    const [auth, accessToken] = authorization.split(' ');
    if (auth?.toLowerCase() != 'bearer' || !accessToken) {
      return false;
    }
    return accessToken;
  }

  /** refreshToken인지 boolean으로 넣음에 따라 refresh | access Token 반환해줌. 문제 있는 경우 false 반환 */
  returnToken({ isRefresh, req }: IReturnToken): string | boolean {
    if (isRefresh) {
      return this.parseRefreshToken(req);
    }
    return this.parseAccessToken(req);
  }

  /** refreshToken인지 boolean으로 넣으면 그에 맞는 secretKey로 verify하며, 통과된 경우 req.user에 sub을 넣고 true 반환 */
  async validateToken({ isRefresh, token, req }: IValidateToken): Promise<boolean> {
    const secretKey = isRefresh ? envKeys.refreshTokenSecret : envKeys.accessTokenSecret;

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.getOrThrow<string>(secretKey),
      });
      req.user = { userId: payload.sub };
      return true;
    } catch (error) {
      // if (error.name === 'TokenExpiredError') {
      //   throw new UnauthorizedException('토큰이 만료되었습니다');
      // }

      // // 이게 토큰 틀릴경우
      // if (error.name === 'JsonWebTokenError') {
      //   throw new UnauthorizedException();
      // }
      // // 토큰 만료 아니면 잘못된 token 이기때문에 벤넣는거 추가할 생각이라면 여기 넣어야 할듯.

      throw new UnauthorizedException();
    }
  }
}
