import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { AuthService } from 'src/apis/01.Auth/auth.service';
import { mockUpdateMyInfoDto, mockUserId } from 'src/common/__test__/unit.mockdata';
import { User } from '../entities/user.entity';
import { Auth } from 'src/apis/01.Auth/entities/auth.entity';
import { mockingAuths, mockingUsers } from 'src/common/__test__/e2e.mockdata';
import { AppModule } from 'src/app.module';
import { E2eError, E2eUpdate, E2eUser } from 'src/common/__test__/e2e.interface';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  let accessToken: string;
  let accessToken2: string;

  let users: User[];
  let auths: Auth[];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    dataSource = app.get<DataSource>(DataSource);
    const authService = moduleFixture.get<AuthService>(AuthService);
    accessToken = authService.getAccessToken({ userId: mockUserId });
    accessToken2 = authService.getAccessToken({ userId: 2 });

    const authRepository = dataSource.getRepository(Auth);
    const userReposityory = dataSource.getRepository(User);

    users = mockingUsers(userReposityory);
    auths = mockingAuths(authRepository, users);

    await userReposityory.save(users);
    await authRepository.save(auths);
  });

  afterAll(async () => {
    await dataSource.synchronize(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    await dataSource.destroy();
    await app.close();
  });

  describe('[GET /user]', () => {
    it('myInfo(User) 데이터 가져오기', async () => {
      const { statusCode, body }: E2eUser = await request(app.getHttpServer())
        .get('/user')
        .set('authorization', `Bearer ${accessToken}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('kWh');
      expect(body).toHaveProperty('recWeight');
      expect(body).toHaveProperty('businessNumber');
      expect(body).toHaveProperty('address');
      expect(body).toHaveProperty('role');
      expect(body).toHaveProperty('createdAt');
    });
  });

  describe('[PUT /user', () => {
    it('User 데이터 업데이트 하기 성공', async () => {
      const { statusCode, body }: E2eUpdate = await request(app.getHttpServer())
        .put('/user')
        .set('authorization', `Bearer ${accessToken}`)
        .send(mockUpdateMyInfoDto);

      expect(statusCode).toBe(200);
      expect(body.affected).toBe(1);
    });

    it('User 데이터 업데이트 하기 실패: 사업자 번호 중복', async () => {
      const { statusCode, body }: E2eError = await request(app.getHttpServer())
        .put('/user')
        .set('authorization', `Bearer ${accessToken2}`)
        .send(mockUpdateMyInfoDto);

      expect(statusCode).toBe(400);
      expect(body.message).toBe('사업자 번호 중복');
    });
  });
});
