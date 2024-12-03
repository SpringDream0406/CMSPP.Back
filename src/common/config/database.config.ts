import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { envKeys } from './validation.schema';
import * as fs from 'fs';

export const databaseConfig = {
  useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
    const isProd = configService.get<string>(envKeys.env) === 'prod';

    return {
      type: configService.get<string>(envKeys.dbType) as 'postgres',
      host: configService.get<string>(envKeys.dbHost),
      port: configService.get<number>(envKeys.dbPort),
      username: configService.get<string>(envKeys.dbUsername),
      password: configService.get<string>(envKeys.dbPassword),
      database: configService.get<string>(envKeys.dbDatabase),
      autoLoadEntities: true, // 각각의 entity 일일이 입력 or 자동
      synchronize: isProd ? false : true, // 스키마 동기화
      logging: false, // 쿼리 실행 내역 터미널에 띄움
      ssl: isProd
        ? {
            ca: fs.readFileSync('/etc/ssl/certs/ap-northeast-2-bundle.pem'),
          }
        : false,
    };
  },
  inject: [ConfigService],
};
