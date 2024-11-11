import { TestBed } from '@automock/jest';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import {
  mockDeleteResultAffected_1,
  mockRes,
  mockSecret,
  mockUserId,
} from 'src/common/__test__/test.mockdata';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: jest.Mocked<AuthService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    const { unit, unitRef } = TestBed.create(AuthController).compile();

    authController = unit;
    authService = unitRef.get<AuthService>(AuthService);
    configService = unitRef.get<ConfigService>(ConfigService);
  });

  describe('signUp', () => {
    it('소셜 회원가입/로그인', async () => {
      const mockReq = { user: { id: 'mockId', provider: 'mockProvider' } } as any;

      jest.spyOn(authService, 'signUp').mockResolvedValue(null);
      jest.spyOn(configService, 'get').mockReturnValue(mockSecret);

      await authController.signUp(mockReq, mockRes);

      expect(authService.signUp).toHaveBeenCalledWith({ ...mockReq, res: mockRes });
      expect(mockRes.redirect).toHaveBeenCalledWith(mockSecret);
    });

    it('소셜 회원가입/로그인 실패: req.user 없음', () => {
      const mockReq = {} as any;

      expect(authController.signUp(mockReq, mockRes)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.signUp).not.toHaveBeenCalled();
    });
  });

  describe('withdrawal', () => {
    it('회원탈퇴', async () => {
      jest.spyOn(authService, 'withdrawal').mockResolvedValue(mockDeleteResultAffected_1);

      const result = await authController.withdrawal(mockUserId);

      expect(result).toBe(mockDeleteResultAffected_1);
      expect(authService.withdrawal).toHaveBeenCalledWith({ userId: mockUserId });
    });
  });

  describe('getAccessToken', () => {
    it('엑세스 토큰 발급', () => {
      jest.spyOn(authService, 'getAccessToken').mockReturnValue('mockAccessToken');

      const result = authController.getAccessToken(mockUserId);

      expect(result).toBe('mockAccessToken');
      expect(authService.getAccessToken).toHaveBeenCalledWith({ userId: mockUserId });
    });
  });
});
