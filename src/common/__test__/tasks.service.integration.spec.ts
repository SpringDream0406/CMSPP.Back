import { DataSource, Repository } from 'typeorm';
import { TasksService } from '../schedule/tasks.service';
import { User } from 'src/apis/02.User/entity/user.entity';
import { Auth } from 'src/apis/01.Auth/entity/auth.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Solar } from 'src/apis/03.SPP/entity/solar.entity';
import { IBackup, newDb } from 'pg-mem';
import { DBDataFactory, getEntitis } from '../data/db.mockdata';
import { initPgMem } from '../config/initPgMem';

describe('TasksService_Integration', () => {
  let tasksService: TasksService;

  let userRepository: Repository<User>;
  let authRepository: Repository<Auth>;
  let solarRepository: Repository<Solar>;

  let dataSource: DataSource;
  let dBDataFactory: DBDataFactory;
  let backup: IBackup;

  beforeAll(async () => {
    const db = newDb();
    const entities = getEntitis();
    dataSource = await initPgMem('TasksService_Integration', db, entities);

    const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(), TypeOrmModule.forFeature(entities)],
      providers: [TasksService],
    })
      .overrideProvider(DataSource)
      .useValue(dataSource)
      .compile();

    tasksService = module.get<TasksService>(TasksService);

    const entityManager = dataSource.createEntityManager();
    dBDataFactory = new DBDataFactory(entityManager);

    userRepository = dataSource.getRepository(User);
    authRepository = dataSource.getRepository(Auth);
    solarRepository = dataSource.getRepository(Solar);

    backup = db.backup();
  });

  afterEach(() => {
    backup.restore();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('should be defined', () => {
    expect(tasksService).toBeDefined();
  });

  describe('removeSoftDeletedUsers', () => {
    it('회원탈퇴 7일 이상인 사용자 정보 전체 삭제', async () => {
      // given
      await dBDataFactory.insertDatas([1, 2]);

      const deletedUserId = 1;
      const updateResult = await userRepository.update(
        { id: deletedUserId },
        { deletedAt: new Date(`2024-01-01`) },
      );
      expect(updateResult.affected).toBe(1);

      // when
      await tasksService.removeSoftDeletedUsers();

      const authAfter = await authRepository.find({
        relations: { user: true },
      });
      const userAfter = await userRepository.find();
      const solarAfter = await solarRepository.find();
      const sRecAfter = await solarRepository.find();
      const expenseAfter = await solarRepository.find();
      const fixedExpenseAfter = await solarRepository.find();

      // then
      expect(authAfter).toHaveLength(1);
      expect(authAfter[0].user.id).not.toBe(deletedUserId);
      expect(userAfter).toHaveLength(1);
      expect(solarAfter).toHaveLength(1);
      expect(sRecAfter).toHaveLength(1);
      expect(expenseAfter).toHaveLength(1);
      expect(fixedExpenseAfter).toHaveLength(1);
    });
  });
});
