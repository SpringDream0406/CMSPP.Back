import { TestBed } from '@automock/jest';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { TestMockData } from 'src/common/data/test.mockdata';

describe('UserController', () => {
  let userController: UserController;
  let userService: jest.Mocked<UserService>;

  beforeEach(() => {
    const { unit, unitRef } = TestBed.create(UserController).compile();

    userController = unit;
    userService = unitRef.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  // --
  describe('fetchMyInfo', () => {
    // --
    it('myInfo 데이터 가져오기', async () => {
      const userId_1 = 1;
      const user = TestMockData.user({});

      jest.spyOn(userService, 'findOneByUserIdForMyInfo').mockResolvedValue(user);

      const result = await userController.fetchMyInfo(userId_1);

      expect(result).toBe(user);
      expect(userService.findOneByUserIdForMyInfo).toHaveBeenCalledWith({
        userId: userId_1,
      });
    });
  });

  // --
  describe('updateMyInfo', () => {
    // --
    it('myInfo 업데이트', async () => {
      const userId_1 = 1;
      const updateResult_1 = TestMockData.updateResult({ affected: 1 });
      const updateMyInfoDto = TestMockData.updateMyInfoDto({});

      jest.spyOn(userService, 'updateMyInfo').mockResolvedValue(updateResult_1);

      const result = await userController.updateMyInfo(userId_1, updateMyInfoDto);

      expect(result).toBe(updateResult_1);
      expect(userService.updateMyInfo).toHaveBeenCalledWith({
        userId: userId_1,
        updateMyInfoDto,
      });
    });
  });

  // --
  describe('withdrawal', () => {
    // --
    it('회원탈퇴', async () => {
      const userId_1 = 1;
      const deleteResult_1 = TestMockData.deleteResult({ affected: 1 });

      jest.spyOn(userService, 'withdrawal').mockResolvedValue(deleteResult_1);

      const result = await userController.withdrawal(userId_1);

      expect(result).toBe(deleteResult_1);
      expect(userService.withdrawal).toHaveBeenCalledWith({ userId: userId_1 });
    });
  });
});
