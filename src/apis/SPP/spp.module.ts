import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Solar } from './entities/solar.entity';
import { SppService } from './spp.service';
import { SppController } from './spp.controller';
import { UserModule } from '../02.Users/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Solar, //
    ]),
    UserModule,
  ],
  providers: [
    SppService, //
  ],
  controllers: [
    SppController, //
  ],
})
export class SppModule {}
