import { TestBed } from '@automock/jest';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { DeleteResult } from 'typeorm';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: jest.Mocked<AuthService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(AuthController).compile();

    authController = unit;
    authService = unitRef.get<AuthService>(AuthService);
    configService = unitRef.get<ConfigService>(ConfigService);
  });

  const userId = 1;

  describe('signUp', () => {
    it('소셜 회원가입/로그인', async () => {
      const mockReq = { user: { id: 'mockId', provider: 'mockProvider' } };
      const mockRes = { redirect: jest.fn() } as any;

      jest.spyOn(authService, 'signUp').mockResolvedValue(null);
      jest.spyOn(configService, 'get').mockReturnValue('mockSecret');

      await authController.signUp(mockReq as any, mockRes);

      expect(authService.signUp).toHaveBeenCalledWith({ ...mockReq, res: mockRes });
      expect(mockRes.redirect).toHaveBeenCalledWith('mockSecret');
    });
  });

  describe('withdrawal', () => {
    it('회원탈퇴', async () => {
      const mockDeleteResult: DeleteResult = { raw: [], affected: 1 };

      jest.spyOn(authService, 'withdrawal').mockResolvedValue(mockDeleteResult);

      const result = await authController.withdrawal(userId);

      expect(result).toBe(mockDeleteResult);
      expect(authService.withdrawal).toHaveBeenCalledWith({ userId });
    });
  });

  describe('getAccessToken', () => {
    it('엑세스 토큰 발급', () => {
      jest.spyOn(authService, 'getAccessToken').mockReturnValue('mockAccessToken');

      const result = authController.getAccessToken(userId);

      expect(result).toBe('mockAccessToken');
      expect(authService.getAccessToken).toHaveBeenCalledWith({ userId });
    });
  });
});
