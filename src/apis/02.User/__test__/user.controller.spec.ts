import { TestBed } from '@automock/jest';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import {
  mockDeleteResultAffected_1,
  mockUpdateMyInfoDto,
  mockUpdateResultAffected_1,
  mockUser,
  mockUserId,
} from 'src/common/__test__/test.mockdata';

describe('UserController', () => {
  let userController: UserController;
  let userService: jest.Mocked<UserService>;

  beforeEach(() => {
    const { unit, unitRef } = TestBed.create(UserController).compile();

    userController = unit;
    userService = unitRef.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('fetchMyInfo', () => {
    it('myInfo 데이터 가져오기', async () => {
      jest.spyOn(userService, 'findOneByUserIdForMyInfo').mockResolvedValue(mockUser);

      const result = await userController.fetchMyInfo(mockUserId);

      expect(result).toBe(mockUser);
      expect(userService.findOneByUserIdForMyInfo).toHaveBeenCalledWith({
        userId: mockUserId,
      });
    });
  });

  describe('updateMyInfo', () => {
    it('myInfo 업데이트', async () => {
      jest
        .spyOn(userService, 'updateMyInfo')
        .mockResolvedValue(mockUpdateResultAffected_1);

      const result = await userController.updateMyInfo(mockUserId, mockUpdateMyInfoDto);

      expect(result).toBe(mockUpdateResultAffected_1);
      expect(userService.updateMyInfo).toHaveBeenCalledWith({
        userId: mockUserId,
        updateMyInfoDto: mockUpdateMyInfoDto,
      });
    });
  });

  describe('withdrawal', () => {
    it('회원탈퇴', async () => {
      jest.spyOn(userService, 'withdrawal').mockResolvedValue(mockDeleteResultAffected_1);

      const result = await userController.withdrawal(mockUserId);

      expect(result).toBe(mockDeleteResultAffected_1);
      expect(userService.withdrawal).toHaveBeenCalledWith({ userId: mockUserId });
    });
  });
});
