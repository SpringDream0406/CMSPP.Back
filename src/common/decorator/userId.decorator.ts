import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export const UserId = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const req = context.switchToHttp().getRequest();
  if (!req || !req.user || !req.user.userId) throw new UnauthorizedException();

  return req.user.userId;
});
