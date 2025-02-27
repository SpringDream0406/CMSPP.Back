import { Get } from '@nestjs/common';
import { Public } from './common/decorator/public.decorator';

export class AppController {
  @Get()
  @Public()
  main(): string {
    return 'CMSPP';
  }
}
