import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { AuthService } from '../auth.service';
import { TestBed } from '@automock/jest';
import { Auth } from '../entities/auth.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IOAuthUserData } from '../interfaces/auth.interface';
import { Response } from 'express';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

describe('AuthService', () => {
  let authService: AuthService;
  let authRepository: jest.Mocked<Repository<Auth>>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(AuthService).compile();

    authService = unit;
    authRepository = unitRef.get(getRepositoryToken(Auth) as string);
    configService = unitRef.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signUp', () => {
    const mockUser: IOAuthUserData = { id: 'testId', provider: 'google' };
    const mockRes = {} as Response;
    const mockAuth = {
      ...mockUser,
      user: {
        id: 1,
      },
    };

    beforeEach(() => {
      jest.spyOn(authService, 'setRefreshToken').mockImplementation(() => {});
    });

    it('로그인: auth(DB)에 데이터가 있을 때, 데이터 그대로 씀', async () => {
      jest
        .spyOn(authService, 'findOneByUserFromAuth')
        .mockResolvedValue(mockAuth as Auth);

      await authService.signUp({ user: mockUser, res: mockRes });

      expect(authService.findOneByUserFromAuth).toHaveBeenCalledWith({ user: mockUser });
      expect(authService.setRefreshToken).toHaveBeenCalledWith({
        userId: mockAuth.user.id,
        res: mockRes,
      });
    });

    it('회원가입: auth(DB)에 데이터가 없을 때, 회원가입 후 반환된 데이터 씀', async () => {
      jest.spyOn(authService, 'findOneByUserFromAuth').mockResolvedValue(null);
      jest.spyOn(authService, 'saveUser').mockResolvedValue(mockAuth as Auth);

      await authService.signUp({ user: mockUser, res: mockRes });

      expect(authService.findOneByUserFromAuth).toHaveBeenCalledWith({ user: mockUser });
      expect(authService.saveUser).toHaveBeenCalledWith({ user: mockUser });
    });
  });

  describe('withdrawal', () => {
    const userId = 1;

    it('회원탈퇴: 성공', async () => {
      const mockDeleteResult: DeleteResult = { raw: [], affected: 1 };

      jest
        .spyOn(authRepository, 'softDelete')
        .mockResolvedValue(mockDeleteResult as UpdateResult);

      const result = await authService.withdrawal({ userId });

      expect(result).toEqual(mockDeleteResult);
      expect(authRepository.softDelete).toHaveBeenCalledWith({ user: { id: userId } });
    });

    it('회원탈퇴: 결과 없는경우 404 에러', async () => {
      const mockDeleteResult: DeleteResult = { raw: [], affected: 0 };

      jest
        .spyOn(authRepository, 'softDelete')
        .mockResolvedValue(mockDeleteResult as UpdateResult);

      await expect(authService.withdrawal({ userId })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  //   describe('setRefreshToken', () => {
  //     const userId = 1;
  //     const mockRes = {} as Response;

  //     it('리프래시토큰 발급(개발환경)', () => {
  //       jest.spyOn(configService, 'get').mockReturnValue('refreshSecret');
  //     });
  //   });
});
