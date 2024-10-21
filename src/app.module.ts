import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './apis/01.Auth/auth.module';
import { UserModule } from './apis/02.Users/user.module';
import { SppModule } from './apis/SPP/spp.module';
import { databaseConfig } from './common/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), //
    AuthModule,
    UserModule,
    SppModule,
    TypeOrmModule.forRootAsync(databaseConfig),
  ],
})
export class AppModule {}
