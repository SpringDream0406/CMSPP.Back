import { BadRequestException, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export const SOCIAL_PROVIDERS = ['google', 'kakao', 'naver'];

export const DYNAMISC_AUTH_GUARD = SOCIAL_PROVIDERS.reduce((prev, curr) => {
  return { ...prev, [curr]: new (class extends AuthGuard(curr) {})() };
}, {});

// const DYNAMISC_AUTH_GUARD = {
//   google: new (class extends AuthGuard('google') {})(),
//   kakao: new (class extends AuthGuard('kakao') {})(),
//   naver: new (class extends AuthGuard('naver') {})(),
// };

export class DynamicAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const { social } = context.switchToHttp().getRequest().params;
    if (!SOCIAL_PROVIDERS.includes(social)) {
      throw new BadRequestException('잘못된 소셜 요청');
    }
    return DYNAMISC_AUTH_GUARD[social].canActivate(context);
  }
}
