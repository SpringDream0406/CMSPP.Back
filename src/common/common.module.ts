import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CommonService } from './common.service';
import { TasksService } from './schedule/tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/apis/02.User/entity/user.entity';

@Module({
  imports: [
    JwtModule.register({}), //
    TypeOrmModule.forFeature([
      User, //
    ]),
  ],
  providers: [
    CommonService, //
    TasksService,
  ],
  exports: [
    CommonService, //
  ],
})
export class CommonModule {}
