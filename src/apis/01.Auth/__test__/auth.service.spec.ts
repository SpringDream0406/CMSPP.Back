import { AuthService } from '../auth.service';
import { TestBed } from '@automock/jest';
import { Auth } from '../entity/auth.entity';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  mockReqUser,
  mockRes,
  mockSecret,
  mockToken,
  mockUpdateResultAffected_1,
  mockUserId,
} from 'src/common/__test__/test.mockdata';
import { UserService } from 'src/apis/02.User/user.service';

console.log(`.env${process.env.NODE_ENV ?? ''}`);

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    const { unit, unitRef } = TestBed.create(AuthService).compile();

    authService = unit;
    userService = unitRef.get(UserService);
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
    const mockAuth = {
      ...mockReqUser,
      user: { id: 1 },
    } as Auth;

    beforeEach(() => {
      jest.spyOn(authService, 'setRefreshToken').mockImplementation(() => {});
    });

    it('로그인: auth(DB)에 데이터가 있을 때, 데이터 그대로 씀', async () => {
      jest.spyOn(authService, 'findOneByUserFromAuth').mockResolvedValue(mockAuth);

      await authService.signUp({ user: mockReqUser, res: mockRes });

      expect(authService.findOneByUserFromAuth).toHaveBeenCalledWith({
        user: mockReqUser,
      });
      expect(authService.setRefreshToken).toHaveBeenCalledWith({
        userId: mockAuth.user.id,
        res: mockRes,
      });
    });

    it('재가입: user(DB)에 softDelete된 데이터가 있을 때, 기존 데이터를 restore 하고 사용함.', async () => {
      const softDeletedMockAuth = {
        ...mockReqUser,
        user: {
          id: 1,
          deletedAt: new Date('2024-01-01'),
        },
      } as Auth;

      jest
        .spyOn(authService, 'findOneByUserFromAuth')
        .mockResolvedValue(softDeletedMockAuth);

      jest
        .spyOn(userService, 'restoreUser')
        .mockResolvedValue(mockUpdateResultAffected_1);

      await authService.signUp({ user: mockReqUser, res: mockRes });

      expect(authService.findOneByUserFromAuth).toHaveBeenCalledWith({
        user: mockReqUser,
      });
      expect(userService.restoreUser).toHaveBeenCalledWith(softDeletedMockAuth);
      expect(authService.setRefreshToken).toHaveBeenCalledWith({
        userId: mockAuth.user.id,
        res: mockRes,
      });
    });

    it('회원가입: auth(DB)에 데이터가 없을 때, 회원가입 후 반환된 데이터 씀', async () => {
      jest.spyOn(authService, 'findOneByUserFromAuth').mockResolvedValue(null);
      jest.spyOn(authService, 'saveUser').mockResolvedValue(mockAuth);

      await authService.signUp({ user: mockReqUser, res: mockRes });

      expect(authService.findOneByUserFromAuth).toHaveBeenCalledWith({
        user: mockReqUser,
      });
      expect(authService.saveUser).toHaveBeenCalledWith({ user: mockReqUser });
    });
  });

  describe('getAccessToken / getRefreshToken', () => {
    beforeEach(() => {
      jest.spyOn(configService, 'get').mockReturnValue(mockSecret);
      jest.spyOn(jwtService, 'sign').mockReturnValue(mockToken);
    });

    it('accessToken 발급', () => {
      const result = authService.getAccessToken({ userId: mockUserId });

      expect(result).toBe(mockToken);
      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: mockUserId },
        { secret: mockSecret, expiresIn: '15m' },
      );
    });

    it('refreshToken 발급', () => {
      const result = authService.getRefreshToken({ userId: mockUserId });

      expect(result).toBe(mockToken);
      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          sub: mockUserId,
        },
        { secret: mockSecret, expiresIn: '24h' },
      );
    });
  });

  describe('setRefreshToken', () => {
    it.each(['test', 'dev'])('리프래시토큰 발급 - %s', (env) => {
      jest.spyOn(authService, 'getRefreshToken').mockReturnValue(mockToken);
      jest.spyOn(configService, 'get').mockReturnValue(env);

      authService.setRefreshToken({ userId: mockUserId, res: mockRes });

      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'set-Cookie',
        `refreshToken=${mockToken}; path=/;`,
      );
    });

    it('prod', () => {});
  });
});
