import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './apis/01.Auth/auth.module';
import { UserModule } from './apis/02.User/user.module';
import { SppModule } from './apis/03.SPP/spp.module';
import { databaseConfig } from './common/config/database.config';
import { APP_GUARD } from '@nestjs/core';
import { CustomAuthGuard } from './common/guard/customAuth.guard';
import { CommonModule } from './common/common.module';
// import { APP_INTERCEPTOR } from '@nestjs/core';
// import { ResponseTimeInterceptor } from './common/interceptor/response-time.interceptor';
import { validationSchema } from './common/config/validation.schema';

// console.log(`.env${process.env.NODE_ENV ?? ''}`);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, //
      validationSchema: validationSchema,
      envFilePath: `.env${process.env.NODE_ENV ?? ''}`,
    }), //
    AuthModule,
    UserModule,
    SppModule,
    CommonModule,
    TypeOrmModule.forRootAsync(databaseConfig),
  ],
  providers: [
    // { provide: APP_INTERCEPTOR, useClass: ResponseTimeInterceptor },
    { provide: APP_GUARD, useClass: CustomAuthGuard },
  ],
})
export class AppModule {}
