import { newDb } from 'pg-mem';
import { EntityTarget } from 'typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const a = {
  useFactory: async (): Promise<TypeOrmModuleOptions> => {
    const entities: EntityTarget<any>[] = [
      /* 엔티티들 */
    ];

    const db = newDb();

    // pg-mem 관련 함수들 등록
    db.public.registerFunction({
      name: 'current_database',
      implementation: () => 'test',
    });

    db.public.registerFunction({
      name: 'version',
      implementation: () => 'test',
    });

    // TypeOrm에 맞는 데이터 소스 생성
    const dataSource = await db.adapters.createTypeormDataSource({
      type: 'postgres',
      entities,
      synchronize: true,
    });

    // TypeOrmModuleOptions 반환
    return {
      type: 'postgres',
      host: 'localhost', // 임의로 설정 (필요에 맞게 변경)
      port: 5432, // 임의로 설정 (필요에 맞게 변경)
      username: 'user', // 임의로 설정 (필요에 맞게 변경)
      password: 'password', // 임의로 설정 (필요에 맞게 변경)
      database: 'test',
      autoLoadEntities: true,
      synchronize: true,
      logging: false,
      // 생성된 dataSource의 연결 정보를 반환
      ...dataSource.options,
    };
  },
};
