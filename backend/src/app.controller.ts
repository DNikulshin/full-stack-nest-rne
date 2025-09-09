import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from './auth/public.decorator';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @ApiOperation({ 
    summary: 'Get hello message',
    description: 'Returns a welcome message for the API'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Return hello message.',
    example: 'Hello World!'
  })
  getHello(): string {
    return this.appService.getHello();
  }
}