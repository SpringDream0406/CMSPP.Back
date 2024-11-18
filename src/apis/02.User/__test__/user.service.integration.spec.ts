import { UserService } from '../user.service';
import { DataSource, Repository } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TestMockData } from 'src/common/data/test.mockdata';
import { IBackup, newDb } from 'pg-mem';
import { DBDataFactory, getEntitis } from 'src/common/data/db.mockdata';
import { initPgMem } from 'src/common/config/initPgMem';
import { User } from '../entity/user.entity';

describe('UserService_Integration', () => {
  let userService: UserService;
  let userRepository: Repository<User>;

  let dataSource: DataSource;
  let dBDataFactory: DBDataFactory;
  let backup: IBackup;

  beforeAll(async () => {
    const db = newDb();
    const entities = getEntitis();
    dataSource = await initPgMem('UserService_Integration', db, entities);

    const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(), TypeOrmModule.forFeature(entities)],
      providers: [UserService],
    })
      .overrideProvider(DataSource)
      .useValue(dataSource)
      .compile();

    userService = module.get(UserService);
    userRepository = dataSource.getRepository(User);

    const entityManager = dataSource.createEntityManager();
    dBDataFactory = new DBDataFactory(entityManager);

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
    expect(userService).toBeDefined();
  });

  describe('updateMyInfo', () => {
    it('myInfo 업데이트 성공', async () => {
      // given
      await dBDataFactory.insertUsersAndAuths([1, 2]);
      const userId_1 = 1;
      const updateMyInfoDto = TestMockData.updateMyInfoDto({});

      // when
      const result = await userService.updateMyInfo({
        userId: userId_1,
        updateMyInfoDto,
      });

      // then
      expect(result.affected).toBe(1);
    });

    it('myInfo 업데이트 실패: 사업자 번호 중복', async () => {
      // given
      await dBDataFactory.insertUsersAndAuths([1, 2]);
      const userId_2 = 2;
      const updateMyInfoDto = TestMockData.updateMyInfoDto({
        businessNumber: '123456781',
      }); // user 1번과 중복되는 businessNumber

      jest.spyOn(userRepository, 'update');

      // when & then
      await expect(
        userService.updateMyInfo({
          userId: userId_2,
          updateMyInfoDto,
        }),
      ).rejects.toThrow(BadRequestException);
      expect(userRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('withdrawal', () => {
    it('회원탈퇴: 성공', async () => {
      // given
      await dBDataFactory.insertUsersAndAuths([1, 2]);
      const userId_1 = 1;

      // when
      const result = await userService.withdrawal({ userId: userId_1 });

      // then
      expect(result.affected).toBe(1);
    });

    it('회원탈퇴: 결과 없는경우 404 에러', async () => {
      await dBDataFactory.insertUsersAndAuths([1, 2]);
      const userId_1 = 999;

      await expect(userService.withdrawal({ userId: userId_1 })).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
