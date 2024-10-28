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
    if (isPublic) return true;

    // 잘못된 요청
    const req: Request = context.switchToHttp().getRequest();
    const [auth, token] = req.headers.authorization?.split(' ');
    if (auth !== 'Bearer' || !token) return false;

    // 토큰 검증, req에 user 넣기
    try {
      const playload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>(envKeys.accessTokenSecret),
      });
      req.user = { userNumber: playload.sub };
      return true;
    } catch (error) {
      //   if (error.name === 'TokenExpiredError')
      //     throw new UnauthorizedException('토큰이 만료되었습니다');
      throw new UnauthorizedException();
    }
  }
}
