import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth } from './entity/auth.entity';
import { JwtModule } from '@nestjs/jwt';
import { JwtGoogleStrategy } from 'src/common/auth/jwt-social-google.strategy';
import { JwtKakaoStrategy } from 'src/common/auth/jwt-social-kakao.strategy';
import { JwtNaverStrategy } from 'src/common/auth/jwt-social-naver.strategy';
import { UserModule } from '../02.User/user.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Auth, //
    ]), //
    JwtModule.register({}),
    UserModule,
    HttpModule,
  ],
  providers: [
    AuthService, //
    JwtGoogleStrategy,
    JwtKakaoStrategy,
    JwtNaverStrategy,
  ],
  controllers: [
    AuthController, //
  ],
  exports: [
    AuthService, //
  ],
})
export class AuthModule {}
