import { TestBed } from '@automock/jest';
import { UserService } from '../user.service';
import { Repository, UpdateResult } from 'typeorm';
import { User } from '../entity/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import {
  mockDeleteResultAffected_0,
  mockDeleteResultAffected_1,
  mockUpdateMyInfoDto,
  mockUpdateResultAffected_1,
  mockUser,
  mockUserId,
} from 'src/common/__test__/test.mockdata';

describe('UserService', () => {
  let userService: UserService;
  let userReposityory: jest.Mocked<Repository<User>>;

  beforeEach(() => {
    const { unit, unitRef } = TestBed.create(UserService).compile();

    userService = unit;
    userReposityory = unitRef.get(getRepositoryToken(User) as string);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('updateMyInfo', () => {
    beforeEach(() => {
      jest.spyOn(userService, 'findOneByBusinessNumber').mockResolvedValue(mockUser);
    });

    it('myInfo 업데이트 성공', async () => {
      jest.spyOn(userReposityory, 'update').mockResolvedValue(mockUpdateResultAffected_1);

      const result = await userService.updateMyInfo({
        userId: mockUserId,
        updateMyInfoDto: mockUpdateMyInfoDto,
      });

      expect(result).toBe(mockUpdateResultAffected_1);
      expect(userService.findOneByBusinessNumber).toHaveBeenCalledWith({
        businessNumber: mockUpdateMyInfoDto.businessNumber,
      });
      expect(userReposityory.update).toHaveBeenCalledWith(
        { id: mockUserId },
        mockUpdateMyInfoDto,
      );
    });

    it('myInfo 업데이트 실패: 사업자 번호 중복', async () => {
      const mockUserId_2 = 2;

      jest.spyOn(userService, 'findOneByBusinessNumber').mockResolvedValue(mockUser);

      expect(
        userService.updateMyInfo({
          userId: mockUserId_2,
          updateMyInfoDto: mockUpdateMyInfoDto,
        }),
      ).rejects.toThrow(BadRequestException);
      expect(userService.findOneByBusinessNumber).toHaveBeenCalledWith({
        businessNumber: mockUpdateMyInfoDto.businessNumber,
      });
    });
  });

  describe('withdrawal', () => {
    it('회원탈퇴: 성공', async () => {
      jest
        .spyOn(userReposityory, 'softDelete')
        .mockResolvedValue(mockDeleteResultAffected_1 as UpdateResult);

      const result = await userService.withdrawal({ userId: mockUserId });

      expect(result).toBe(mockDeleteResultAffected_1);
      expect(userReposityory.softDelete).toHaveBeenCalledWith({
        id: mockUserId,
      });
    });

    it('회원탈퇴: 결과 없는경우 404 에러', () => {
      jest
        .spyOn(userReposityory, 'softDelete')
        .mockResolvedValue(mockDeleteResultAffected_0 as UpdateResult);

      expect(userService.withdrawal({ userId: mockUserId })).rejects.toThrow(
        BadRequestException,
      );
      expect(userReposityory.softDelete).toHaveBeenCalledWith({
        id: mockUserId,
      });
    });
  });
});
