import { TestBed } from '@automock/jest';
import { CommonService } from '../common.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UnauthorizedException } from '@nestjs/common';

describe('CommonService', () => {
  let commonService: CommonService;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    const { unit, unitRef } = TestBed.create(CommonService).compile();

    commonService = unit;
    jwtService = unitRef.get<JwtService>(JwtService);
    configService = unitRef.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(CommonService).toBeDefined();
  });

  describe('parseRefreshToken', () => {
    it('쿠키에서 refreshToken 가져오기 성공', () => {
      const req = {
        headers: {
          cookie: 'refreshToken=mockRefreshToken',
        },
      } as Request;

      const result = commonService.parseRefreshToken(req);

      expect(result).toBe('mockRefreshToken');
    });

    const cookies = [
      '',
      '=mockRefreshToken',
      'mock=mockRefreshToken',
      'refreshToken=',
      'test',
    ];
    it.each(cookies)('쿠키에서 refreshToken 가져오기 실패: cookie: %s', (cookies) => {
      const req = {
        headers: { cookie: cookies },
      } as Request;

      const result = commonService.parseRefreshToken(req);

      expect(result).toBe(false);
    });
  });

  describe('parseAccessToken', () => {
    it('authorization에서 accessToken 가져오기 성공', () => {
      const req = {
        headers: { authorization: 'Bearer mockAccessToken' },
      } as Request;

      const result = commonService.parseAccessToken(req);

      expect(result).toBe('mockAccessToken');
    });

    const Bearers = ['', ' mockAccessToken', 'mock mockAccessToken', 'Bearer ', 'test'];
    it.each(Bearers)(
      'authorization에서 accessToken 가져오기 실패: authorization: %s',
      (Bearers) => {
        const req = {
          headers: { authorization: Bearers },
        } as Request;

        const result = commonService.parseAccessToken(req);

        expect(result).toBe(false);
      },
    );
  });

  describe('getToken', () => {
    const req = {} as Request;

    it.each(['mockRefreshToken', false])(
      'refresh 일 때, mockReturnValue: %s',
      (mockReturnValue) => {
        jest.spyOn(commonService, 'parseRefreshToken').mockReturnValue(mockReturnValue);

        const result = commonService.getToken({ isRefresh: true, req });

        expect(result).toBe(mockReturnValue);
        expect(commonService.parseRefreshToken).toHaveBeenCalledWith(req);
      },
    );

    it.each(['mockAccessToken', false])(
      'access 일 때, mockReturnValue: %s',
      (mockReturnValue) => {
        jest.spyOn(commonService, 'parseAccessToken').mockReturnValue(mockReturnValue);

        const result = commonService.getToken({ isRefresh: false, req });

        expect(result).toBe(mockReturnValue);
        expect(commonService.parseAccessToken).toHaveBeenCalledWith(req);
      },
    );
  });

  describe('validateToken', () => {
    const payload = {
      sub: 1,
    };
    const token = 'mockToken';
    let req: Request;

    beforeEach(() => {
      req = {} as Request;
      jest.spyOn(configService, 'get').mockReturnValue('secret');
    });

    it.each([true, false])('검증 통과, isRefresh: %s', async (isRefresh) => {
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(payload);

      const result = await commonService.validateToken({ isRefresh, token, req });

      expect(result).toBe(true);
      expect(configService.get).toHaveBeenCalledWith(
        isRefresh ? 'REFRESHTOKEN_SECRET' : 'ACCESSTOKEN_SECRET',
      );
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(token, { secret: 'secret' });
      expect(req.user).toEqual({ userId: payload.sub });
    });

    it.each([true, false])('검증 실패, isRefresh: %s', (isRefresh) => {
      jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue(UnauthorizedException);

      expect(commonService.validateToken({ isRefresh, token, req })).rejects.toThrow(
        UnauthorizedException,
      );
      expect(configService.get).toHaveBeenCalledWith(
        isRefresh ? 'REFRESHTOKEN_SECRET' : 'ACCESSTOKEN_SECRET',
      );
      expect(req.user).toBeUndefined();
    });
  });
});
