import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Public } from '../decorator/public.decorator';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { envKeys } from '../config/validation.schema';

@Injectable()
export class CustomAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Public 데코 pass
    const isPublic = this.reflector.get(Public, context.getHandler());
    if (isPublic && isPublic !== 'refresh') return true;

    // 토큰과 타입 가져오기
    const req: Request = context.switchToHttp().getRequest();
    let token: string;

    if (isPublic === 'refresh') {
      const [auth, refreshToken] = req.headers.cookie?.split('=');
      if (!auth || auth != 'refreshToken' || !refreshToken) return false;
      token = refreshToken;
    } else {
      const [auth, accessToken] = req.headers.authorization?.split(' ');
      if (!auth || auth !== 'Bearer' || !accessToken) return false;
      token = accessToken;
    }

    // 토큰 검증, req에 user 넣기
    const secretKey =
      isPublic === 'refresh' ? envKeys.refreshTokenSecret : envKeys.accessTokenSecret;

    try {
      const playload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>(secretKey),
      });
      req.user = { userId: playload.sub };
      return true;
    } catch (error) {
      //   if (error.name === 'TokenExpiredError')
      //     throw new UnauthorizedException('토큰이 만료되었습니다');

      // 토큰 만료 아니면 잘못된 token 이기때문에 벤넣는거 추가할 생각이라면 여기 넣어야 할듯.
      throw new UnauthorizedException();
    }
  }
}
