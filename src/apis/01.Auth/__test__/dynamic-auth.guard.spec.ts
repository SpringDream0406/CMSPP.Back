import { BadRequestException } from '@nestjs/common';
import {
  DynamicAuthGuard,
  DYNAMISC_AUTH_GUARD,
  SOCIAL_PROVIDERS,
} from '../guards/dynamic-auth.guard';
import { TestMockData } from 'src/common/data/test.mockdata';

describe('DynamicAuthGuard_Unit', () => {
  let dynamicAuthGuard: DynamicAuthGuard;

  beforeAll(() => {
    dynamicAuthGuard = new DynamicAuthGuard();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(dynamicAuthGuard).toBeDefined();
  });

  describe('소셜 인증 가드', () => {
    it.each(SOCIAL_PROVIDERS)('소셜 인증 통과 - %s', (social) => {
      // given
      const mockExecutionContext = TestMockData.executionContext({ params: { social } });
      const providerGuard = DYNAMISC_AUTH_GUARD[social];

      jest.spyOn(providerGuard, 'canActivate').mockReturnValue(true);

      // when
      const result = dynamicAuthGuard.canActivate(mockExecutionContext);

      // then
      expect(result).toBe(true);
    });

    it('쇼셜 인증 실패: 지정한 소셜 로그인이 아닌 경우', () => {
      // given
      const mockExecutionContext = TestMockData.executionContext({ params: 'test' });

      // when & then
      expect(() => dynamicAuthGuard.canActivate(mockExecutionContext)).toThrow(
        BadRequestException,
      );
    });
  });
});
