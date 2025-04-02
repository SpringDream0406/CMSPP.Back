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
    const req = context.switchToHttp().getRequest();
    const { social } = req.params;

    // 로그인 취소했을 경우 = denied
    if (req.query.error) {
      const res = context.switchToHttp().getResponse();
      const frontURL = process.env.FRONT_URL;
      res.redirect(`${frontURL}`);
    }

    if (!SOCIAL_PROVIDERS.includes(social)) {
      throw new BadRequestException('잘못된 소셜 요청');
    }
    return DYNAMISC_AUTH_GUARD[social].canActivate(context);
  }
}
