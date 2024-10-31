import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CommonService } from './common.service';

@Module({
  imports: [
    JwtModule.register({}), //
  ],
  providers: [
    CommonService, //
  ],
  exports: [
    CommonService, //
  ],
})
export class CommonModule {}
