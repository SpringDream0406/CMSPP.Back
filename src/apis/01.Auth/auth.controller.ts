import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DynamicAuthGuard } from './guards/dynamic-auth.guard';
import { IAuthUser, IOAuthUser } from './interface/auth.interface';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 소셜 회원가입/로그인
  @Get('signup/:social')
  @UseGuards(DynamicAuthGuard)
  async SignUp(
    @Req() req: Request & IOAuthUser, //
    @Res() res: Response,
  ) {
    await this.authService.signUp({ user: req.user, res });
    res.redirect('http://localhost:3000');
  }

  @Post('getAccessToken')
  @UseGuards(AuthGuard('refresh'))
  getAccessToken(@Req() req: Request & IAuthUser) {
    if (req.user) {
      return this.authService.getAccessToken({ uid: req.user.uid });
    }
  }
}
