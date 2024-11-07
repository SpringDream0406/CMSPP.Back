import { Repository, UpdateResult } from 'typeorm';
import { AuthService } from '../auth.service';
import { TestBed } from '@automock/jest';
import { Auth } from '../entities/auth.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IOAuthUserData } from '../interfaces/auth.interface';
import { Response } from 'express';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  mockDeleteResultAffected_0,
  mockDeleteResultAffected_1,
  mockUserId,
} from 'src/common/__test__/mockDatas';

describe('AuthService', () => {
  let authService: AuthService;
  let authRepository: jest.Mocked<Repository<Auth>>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    const { unit, unitRef } = TestBed.create(AuthService).compile();

    authService = unit;
    authRepository = unitRef.get(getRepositoryToken(Auth) as string);
    jwtService = unitRef.get(JwtService);
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
    } as Auth;

    beforeEach(() => {
      jest.spyOn(authService, 'setRefreshToken').mockImplementation(() => {});
    });

    it('로그인: auth(DB)에 데이터가 있을 때, 데이터 그대로 씀', async () => {
      jest.spyOn(authService, 'findOneByUserFromAuth').mockResolvedValue(mockAuth);

      await authService.signUp({ user: mockUser, res: mockRes });

      expect(authService.findOneByUserFromAuth).toHaveBeenCalledWith({ user: mockUser });
      expect(authService.setRefreshToken).toHaveBeenCalledWith({
        userId: mockAuth.user.id,
        res: mockRes,
      });
    });

    it('회원가입: auth(DB)에 데이터가 없을 때, 회원가입 후 반환된 데이터 씀', async () => {
      jest.spyOn(authService, 'findOneByUserFromAuth').mockResolvedValue(null);
      jest.spyOn(authService, 'saveUser').mockResolvedValue(mockAuth);

      await authService.signUp({ user: mockUser, res: mockRes });

      expect(authService.findOneByUserFromAuth).toHaveBeenCalledWith({ user: mockUser });
      expect(authService.saveUser).toHaveBeenCalledWith({ user: mockUser });
    });
  });

  describe('withdrawal', () => {
    it('회원탈퇴: 성공', async () => {
      jest
        .spyOn(authRepository, 'softDelete')
        .mockResolvedValue(mockDeleteResultAffected_1 as UpdateResult);

      const result = await authService.withdrawal({ userId: mockUserId });

      expect(result).toBe(mockDeleteResultAffected_1);
      expect(authRepository.softDelete).toHaveBeenCalledWith({
        user: { id: mockUserId },
      });
    });

    it('회원탈퇴: 결과 없는경우 404 에러', () => {
      jest
        .spyOn(authRepository, 'softDelete')
        .mockResolvedValue(mockDeleteResultAffected_0 as UpdateResult);

      expect(authService.withdrawal({ userId: mockUserId })).rejects.toThrow(
        BadRequestException,
      );
      expect(authRepository.softDelete).toHaveBeenCalledWith({
        user: { id: mockUserId },
      });
    });
  });

  describe('getAccessToken', () => {
    it('엑세스토큰 발급', () => {
      const mockToken = 'mockedToken';

      jest.spyOn(configService, 'get').mockReturnValue('mockSecret');
      jest.spyOn(jwtService, 'sign').mockReturnValue(mockToken);

      const result = authService.getAccessToken({ userId: mockUserId });

      expect(result).toBe(mockToken);
      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: mockUserId },
        { secret: 'mockSecret', expiresIn: '15m' },
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
