import { BadRequestException } from '@nestjs/common';
import { DynamicAuthGuard, DYNAMISC_AUTH_GUARD } from '../guards/dynamic-auth.guard';
import { createMockExecutionContext } from 'src/common/__test__/unit.mockdata';

describe('DynamicAuthGuard', () => {
  let dynamicAuthGuard: DynamicAuthGuard;

  beforeEach(() => {
    dynamicAuthGuard = new DynamicAuthGuard();
  });

  describe('소셜 인증 가드', () => {
    it.each(['google', 'kakao', 'naver'])('소셜 인증 통과 - %s', (social) => {
      const mockReq = { params: { social } };
      const mockExecutionContext = createMockExecutionContext(mockReq);
      const providerGuard = DYNAMISC_AUTH_GUARD[social];
      const spy = jest.spyOn(providerGuard, 'canActivate').mockReturnValue(true);

      const result = dynamicAuthGuard.canActivate(mockExecutionContext);
      expect(spy).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('쇼셜 인증 실패: 지정한 소셜 로그인이 아닌 경우', () => {
      const context = {
        switchToHttp: () => ({ getRequest: () => ({ params: 'test' }) }),
      } as any;

      expect(() => dynamicAuthGuard.canActivate(context)).toThrow(BadRequestException);
    });
  });
});
