import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorator/public.decorator';

@Controller()
export class AppController {
  @Get()
  @Public()
  main(): string {
    return 'CMSPP';
  }
}
