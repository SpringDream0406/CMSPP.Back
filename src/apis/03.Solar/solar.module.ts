import { Module } from '@nestjs/common';
import { SolarController } from './solar.controller';
import { SolarService } from './solar.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Solar } from './entities/solar.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Solar, //
    ]),
  ],
  providers: [
    SolarService, //
  ],
  controllers: [
    SolarController, //
  ],
})
export class SolarModule {}
