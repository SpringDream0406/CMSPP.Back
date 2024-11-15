import { UserService } from '../user.service';
import { Repository, UpdateResult } from 'typeorm';
import { User } from '../entity/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TestMockData } from 'src/common/data/test.mockdata';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User), //
          useValue: TestMockData.repository(),
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  // --
  describe('updateMyInfo', () => {
    const updateMyInfoDto = TestMockData.updateMyInfoDto({}); // dto 같음

    beforeEach(() => {
      jest // businessNumber 조회 반환값 같음
        .spyOn(userService, 'findOneByBusinessNumber')
        .mockResolvedValue(TestMockData.user({}));
    });

    // --
    it('myInfo 업데이트 성공', async () => {
      const updateResult_1 = TestMockData.updateResult({ affected: 1 });
      const userId_1 = 1;

      jest.spyOn(userRepository, 'update').mockResolvedValue(updateResult_1);

      const result = await userService.updateMyInfo({
        userId: userId_1,
        updateMyInfoDto,
      });

      expect(result).toBe(updateResult_1);
    });

    // --
    it('myInfo 업데이트 실패: 사업자 번호 중복', async () => {
      const userId_2 = 2;

      await expect(
        userService.updateMyInfo({
          userId: userId_2,
          updateMyInfoDto,
        }),
      ).rejects.toThrow(BadRequestException);
      expect(userRepository.update).not.toHaveBeenCalled();
    });
  });

  // --
  describe('withdrawal', () => {
    const userId_1 = 1; // id 같음

    // --
    it('회원탈퇴: 성공', async () => {
      const deleteResult_1 = TestMockData.deleteResult({ affected: 1 }) as UpdateResult;

      jest.spyOn(userRepository, 'softDelete').mockResolvedValue(deleteResult_1);

      const result = await userService.withdrawal({ userId: userId_1 });

      expect(result).toBe(deleteResult_1);
    });

    // --
    it('회원탈퇴: 결과 없는경우 404 에러', async () => {
      const deleteResult_0 = TestMockData.deleteResult({ affected: 0 }) as UpdateResult;

      jest.spyOn(userRepository, 'softDelete').mockResolvedValue(deleteResult_0);

      await expect(userService.withdrawal({ userId: userId_1 })).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
