import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig = {
  useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
    return {
      type: configService.get<string>('DB_TYPE') as 'mysql',
      host: configService.get<string>('DB_HOST'),
      port: configService.get<number>('DB_PORT'),
      username: configService.get<string>('DB_USERNAME'),
      password: configService.get<string>('DB_PASSWORD'),
      database: configService.get<string>('DB_DATABASE'),
      autoLoadEntities: true, // 각각의 entity 일일이 입력 or 자동
      synchronize: true, // 스키마 동기화
      logging: false, // 쿼리 실행 내역 터미널에 띄움
    };
  },
  inject: [ConfigService],
};
