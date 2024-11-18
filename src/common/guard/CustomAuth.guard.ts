import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Public } from '../decorator/public.decorator';
import { Request } from 'express';
import { CommonService } from '../common.service';

@Injectable()
export class CustomAuthGuard implements CanActivate {
  constructor(
    private readonly commonService: CommonService, //
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Public() = {}
    // Public('refresh') = refresh
    // Public()이 없으면 = undefined
    const isPublic = this.commonService.getMetaData({ decorator: Public, context });
    if (isPublic && isPublic !== 'refresh') {
      return true;
    }

    // 토큰과 타입 가져오기, 토큰로직 통과 못하면 false로 가드에서 막힘
    const req: Request = context.switchToHttp().getRequest();
    const isRefresh = isPublic === 'refresh';
    const token = this.commonService.returnToken({ isRefresh, req });
    if (typeof token === 'boolean') {
      return false;
    }

    // 토큰 검증, req에 user 넣기
    return await this.commonService.validateToken({ isRefresh, token, req });
  }
}
