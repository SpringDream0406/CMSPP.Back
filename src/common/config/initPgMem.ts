import { randomUUID } from 'crypto';
import { DataType, IMemoryDb } from 'pg-mem';
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

  db.registerExtension('uuid-ossp', (schema) => {
    schema.registerFunction({
      name: 'uuid_generate_v4',
      returns: DataType.uuid,
      implementation: randomUUID,
      impure: true,
    });
  });

  db.public.interceptQueries((sql) => {
    const newSql = sql.replace(/\bnumeric\s*\(\s*\d+\s*,\s*\d+\s*\)/g, 'float');
    if (sql !== newSql) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return db.public.many(newSql);
    }

    return null;
  });

  db.public.interceptQueries((queryText) => {
    if (queryText.search(/(pg_views|pg_matviews|pg_tables|pg_enum)/g) > -1) {
      return [];
    }
    return null;
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
