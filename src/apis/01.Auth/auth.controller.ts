import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DynamicAuthGuard } from './guards/dynamic-auth.guard';
import { IAuthUser, IOAuthUser } from './interfaces/auth.interface';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { DeleteResult } from 'typeorm';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  // 소셜 회원가입/로그인
  @Get('signup/:social')
  @UseGuards(DynamicAuthGuard)
  async SignUp(
    @Req() req: Request & IOAuthUser, //
    @Res() res: Response,
  ): Promise<void> {
    await this.authService.signUp({ ...req, res });
    res.redirect(this.configService.get('REDIRECT_URL'));
  }

  // 회원탈퇴
  @Post('withdrawal')
  @UseGuards(AuthGuard('access'))
  withdrawal(@Req() req: Request & IAuthUser): Promise<DeleteResult> {
    if (req.user) {
      return this.authService.withdrawal({ ...req.user });
    }
  }

  // 엑세스 토큰 발급
  @Post('getAccessToken')
  @UseGuards(AuthGuard('refresh'))
  getAccessToken(@Req() req: Request & IAuthUser): string {
    if (req.user) {
      return this.authService.getAccessToken({ ...req.user });
    }
  }
}
