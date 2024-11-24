import { TestBed } from '@automock/jest';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { TestMockData } from 'src/common/data/test.mockdata';
import { Request } from 'express';
import { IOAuthUser } from '../interface/auth.interface';

describe('AuthController_Unit', () => {
  let authController: AuthController;
  let authService: jest.Mocked<AuthService>;
  let configService: jest.Mocked<ConfigService>;

  beforeAll(() => {
    const { unit, unitRef } = TestBed.create(AuthController).compile();

    authController = unit;
    authService = unitRef.get(AuthService);
    configService = unitRef.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('signUp', () => {
    it('소셜 회원가입/로그인', async () => {
      // given
      const req = TestMockData.req();
      req.user = TestMockData.reqUser({});
      const res = TestMockData.res();
      const secret = TestMockData.secret({});

      jest.spyOn(authService, 'signUp').mockResolvedValue(null);
      jest.spyOn(configService, 'getOrThrow').mockReturnValue(secret);
      jest.spyOn(res, 'redirect');

      // when
      await authController.signUp(req as Request & IOAuthUser, res);

      // then
      expect(authService.signUp).toHaveBeenCalledWith({ ...req, res });
      expect(res.redirect).toHaveBeenCalledWith(secret);
    });

    it('소셜 회원가입/로그인 실패: req.user 없음', async () => {
      // given
      const req = TestMockData.req() as Request & IOAuthUser;
      const res = TestMockData.res();

      jest.spyOn(authService, 'signUp').mockResolvedValue(null);

      // when & then
      await expect(authController.signUp(req, res)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.signUp).not.toHaveBeenCalled();
    });
  });

  describe('getAccessToken', () => {
    it('엑세스 토큰 발급', () => {
      // given
      const userId = 1;
      const accessToken = TestMockData.token({});

      jest.spyOn(authService, 'getToken').mockReturnValue(accessToken);

      // when
      const result = authController.getAccessToken(userId);

      // then
      expect(result).toBe(accessToken);
      expect(authService.getToken).toHaveBeenCalledWith({ userId });
    });
  });
});
