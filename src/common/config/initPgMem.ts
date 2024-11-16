import { IMemoryDb } from 'pg-mem';
import { DataSource, EntityTarget } from 'typeorm';

export const initPgMem = async (
  name: string,
  db: IMemoryDb,
  entities: EntityTarget<any>[],
): Promise<DataSource> => {
  //
  db.public.registerFunction({
    name: 'current_database',
    implementation: () => 'test',
  });

  db.public.registerFunction({
    name: 'version',
    implementation: () => 'test',
  });

  const dataSource = await db.adapters.createTypeormDataSource({
    type: 'postgres',
    database: `${name} test`,
    entities,
    synchronize: true,
  });

  await dataSource.initialize();

  return dataSource;
};
