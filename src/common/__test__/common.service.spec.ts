import { TestBed } from '@automock/jest';
import { CommonService } from '../common.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UnauthorizedException } from '@nestjs/common';
import { TestMockData } from '../data/test.mockdata';

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

  // --
  describe('parseRefreshToken', () => {
    // --
    it('쿠키에서 refreshToken 가져오기 성공', () => {
      const refreshToken = 'mockRefreshToken';
      const req = TestMockData.req();
      req.headers.cookie = `refreshToken=${refreshToken}`;

      const result = commonService.parseRefreshToken(req);

      expect(result).toBe(refreshToken);
    });

    // --
    it.each([
      ['cookie가 비어있는 경우', ''],
      ['refresh 글자가 없는 경우', '=mockRefreshToken'],
      ['refresh 대신 다른 글자가 있는 경우', 'mock=mockRefreshToken'],
      ['refreshToken이 없는 경우', 'refreshToken='],
      ['잘못된 토큰 형식', 'test'],
    ])('쿠키에서 refreshToken 가져오기 실패: %s', (_, cookies) => {
      const req = TestMockData.req();
      req.headers.cookie = cookies;

      const result = commonService.parseRefreshToken(req);

      expect(result).toBe(false);
    });
  });

  // --
  describe('parseAccessToken', () => {
    // --
    it('authorization에서 accessToken 가져오기 성공', () => {
      const accessToken = 'mockAccessToken';
      const req = TestMockData.req();
      req.headers.authorization = `Bearer ${mockAccessToken}`;
      const req = {
        headers: { authorization: 'Bearer mockAccessToken' },
      } as Request;

      const result = commonService.parseAccessToken(req);

      expect(result).toBe('mockAccessToken');
    });

    // --
    it.each([
      ['authorization가 비어있는 경우', ''],
      ['Bearer 글자가 없는 경우', ' mockAccessToken'],
      ['Bearer 대신 다른 글자가 있는 경우', 'mock mockAccessToken'],
      ['accessToken이 없는 경우', `Bearer `],
      ['잘못된 토큰 형식', 'test'],
    ])('authorization에서 accessToken 가져오기 실패: %s', (_, Bearers) => {
      const req = {
        headers: { authorization: Bearers },
      } as Request;

      const result = commonService.parseAccessToken(req);

      expect(result).toBe(false);
    });
  });

  // --
  describe('getToken', () => {
    const req = {} as Request;

    // --
    it.each([
      ['cookie가 정상일 때', 'mockRefreshToken'],
      ['cookie에 문제가 있을 때', false],
    ])('refresh 일 때: %s', (_, mockReturnValue) => {
      jest.spyOn(commonService, 'parseRefreshToken').mockReturnValue(mockReturnValue);

      const result = commonService.getToken({ isRefresh: true, req });

      expect(result).toBe(mockReturnValue);
      expect(commonService.parseRefreshToken).toHaveBeenCalledWith(req);
    });

    // --
    it.each([
      ['authorization이 정상일 때', 'mockAccessToken'],
      ['authorization에 문제가 있을 때', false],
    ])('access 일 때, mockReturnValue: %s', (_, mockReturnValue) => {
      jest.spyOn(commonService, 'parseAccessToken').mockReturnValue(mockReturnValue);

      const result = commonService.getToken({ isRefresh: false, req });

      expect(result).toBe(mockReturnValue);
      expect(commonService.parseAccessToken).toHaveBeenCalledWith(req);
    });
  });

  // --
  describe('validateToken', () => {
    const payload = {
      sub: 1,
    };
    const token = mockToken;
    let req: Request;

    beforeEach(() => {
      req = {} as Request;
      jest.spyOn(configService, 'get').mockReturnValue('secret');
    });

    // --
    it.each([
      ['refreshToken 일 때', true],
      ['accessToken 일 때', false],
    ])('검증 통과: %s', async (_, isRefresh) => {
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(payload);

      const result = await commonService.validateToken({ isRefresh, token, req });

      expect(result).toBe(true);
      expect(configService.get).toHaveBeenCalledWith(
        isRefresh ? 'REFRESHTOKEN_SECRET' : 'ACCESSTOKEN_SECRET',
      );
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(token, { secret: 'secret' });
      expect(req.user).toEqual({ userId: payload.sub });
    });

    // --
    it.each([
      ['refreshToken 일 때', true],
      ['accessToken 일 때', false],
    ])('검증 실패: %s', (_, isRefresh) => {
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
