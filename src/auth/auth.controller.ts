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
import { UserRegisterDto } from './dto/UserRegisterDto';
import { LoginResponseDto } from './dto/LoginResponseDto';
import { RegisterResponseDto } from './dto/RegisterResponseDto';

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

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Register',
    description: '',
  })
  @ApiOkResponse({
    type: RegisterResponseDto,
  })
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 6, ttl: 60 } })
  async userRegister(
    @Body() userRegisterDto: UserRegisterDto,
  ): Promise<RegisterResponseDto> {
    return this.authService.register(userRegisterDto);
  }
}
