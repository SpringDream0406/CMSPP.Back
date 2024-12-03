import {
  Controller,
  Get,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { DynamicAuthGuard } from './guards/dynamic-auth.guard';
import { IOAuthUser } from './interface/auth.interface';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { envKeys } from 'src/common/config/validation.schema';
import { Public } from 'src/common/decorator/public.decorator';
import { UserId } from 'src/common/decorator/userId.decorator';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @Public()
  serverCheck(): string {
    return 'Server is working..';
  }

  // 소셜 회원가입/로그인
  @Get('signup/:social')
  @Public()
  @UseGuards(DynamicAuthGuard)
  async signUp(
    @Req() req: Request & IOAuthUser, //
    @Res() res: Response,
  ): Promise<void> {
    if (!req.user) {
      throw new UnauthorizedException();
    }
    await this.authService.signUp({ ...req, res });
    const frontULR = this.configService.getOrThrow(envKeys.frontURL);
    res.redirect(`${frontULR}/setLogin`);
  }

  // 로그아웃 = 쿠키 삭제
  @Get('logout')
  @Public()
  logOut(@Res() res: Response) {
    res.clearCookie('refreshToken');
    res.redirect(this.configService.getOrThrow(envKeys.frontURL));
  }

  // 엑세스 토큰 발급
  @Get('getAccessToken')
  @Public('refresh')
  getAccessToken(@UserId() userId: number): string {
    return this.authService.getToken({ userId });
  }
}
