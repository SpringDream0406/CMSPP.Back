import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './apis/01.Auth/auth.module';
import { UserModule } from './apis/02.User/user.module';
import { SppModule } from './apis/03.SPP/spp.module';
import { databaseConfig } from './common/config/database.config';
import { APP_GUARD } from '@nestjs/core';
import { CommonModule } from './common/common.module';
import { validationSchema } from './common/config/validation.schema';
import { ScheduleModule } from '@nestjs/schedule';
import { CustomAuthGuard } from './common/guard/custom-auth.guard';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, //
      validationSchema: validationSchema,
      // envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
    }), //
    AuthModule,
    UserModule,
    SppModule,
    CommonModule,
    TypeOrmModule.forRootAsync(databaseConfig),
    ScheduleModule.forRoot(),
  ],
  providers: [
    { provide: APP_GUARD, useClass: CustomAuthGuard }, //
  ],
  controllers: [
    AppController, //
  ],
})
export class AppModule {}
