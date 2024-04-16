import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

import { AuthService } from './auth.service';
import { UserLoginDto } from './dto/UserLoginDto';
import { LoginResponseDto } from './dto/LoginResponseDto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(public readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'LogIn',
    description: '',
  })
  @ApiOkResponse({
    type: LoginResponseDto,
  })
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 6, ttl: 60 } })
  async userLogin(
    @Body() userLoginDto: UserLoginDto,
  ): Promise<LoginResponseDto> {
    return this.authService.login(userLoginDto);
  }
}
