import {
  Body,
  Controller,
  Get,
  Param,
  Post,
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

  @Public()
  @Get()
  healthCheck(): string {
    return 'OK';
  }

  // 소셜 회원가입/로그인
  @Get('signup/:social')
  @Public()
  @UseGuards(DynamicAuthGuard)
  async signUp(
    @Req() req: Request & IOAuthUser, //
    @Res() res: Response,
    @Param('social') social: any,
  ): Promise<void> {
    if (!req.user) {
      throw new UnauthorizedException();
    }
    await this.authService.signUp({ ...req, res });
    const frontURL = this.configService.getOrThrow(envKeys.frontURL);
    res.redirect(`${frontURL}/redirect/${social}`);
  }

  @Public()
  @Post('test')
  test(@Res() res: Response) {
    this.authService.setRefreshToken({ userId: 1, res });
    console.log('aa');
    res.status(200).send('로그인 성공');
  }

  // // 소셜 회원가입/로그인
  // @Post('signup/:social')
  // @Public()
  // async signUp(
  //   @Res() res: Response, //
  //   @Param() social: string,
  //   @Body() code: string,
  // ): Promise<void> {
  //   console.log(code);
  //   await this.authService.signUp({ social, code });

  //   // res.redirect(this.configService.getOrThrow(envKeys.frontURL));
  // }

  // 엑세스 토큰 발급
  @Get('getAccessToken')
  @Public('refresh')
  getAccessToken(@UserId() userId: number): string {
    return this.authService.getToken({ userId });
  }
}
