import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IBackup, newDb } from 'pg-mem';
import { Role, User } from 'src/apis/02.User/entity/user.entity';
import { UserService } from 'src/apis/02.User/user.service';
import { Expense } from 'src/apis/03.SPP/entity/expense.entity';
import { FixedExpense } from 'src/apis/03.SPP/entity/fixedExpense.entity';
import { Solar } from 'src/apis/03.SPP/entity/solar.entity';
import { SRec } from 'src/apis/03.SPP/entity/sRec.entity';
import { initPgMem } from 'src/common/config/initPgMem';
import { DataSource, Repository } from 'typeorm';

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;
  let backup: IBackup;

  beforeAll(async () => {
    const db = newDb();
    const entities = [User, Solar, SRec, Expense, FixedExpense];
    const dataSource = await initPgMem('userService', db, entities);

    const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(), TypeOrmModule.forFeature(entities)],
      providers: [UserService],
    })
      .overrideProvider(DataSource)
      .useValue(dataSource)
      .compile();

    service = module.get<UserService>(UserService);
    repository = dataSource.getRepository(User);

    backup = db.backup();
  });

  afterEach(async () => {
    backup.restore();
    console.log('restore');
  });

  describe('', () => {
    it('', async () => {
      console.log('1', await repository.find());
      await repository.save({ role: Role.USER });
      console.log('2', await repository.find());
    });

    it('', async () => {
      console.log('3', await repository.find());
    });
  });
});
