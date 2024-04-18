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

/**
 * Controller to manage authentication related actions like user registration and login.
 */

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  /**
   * Dependency injection of AuthService to handle the business logic.
   * @param authService - The injected service for authentication operations.
   */
  constructor(public readonly authService: AuthService) {}

  /**
   * Endpoint to manage user login. It allows users to log in by validating credentials
   * and returns a structured login response.
   * 
   * Throttling is applied to limit the number of login attempts to prevent brute force attacks.
   * - Limit: 6 attempts per 60 seconds.
   *
   * @param userLoginDto - The user's login credentials.
   * @returns A Promise resolving to a LoginResponseDto that contains JWT token and user details.
   */
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

  /**
   * Endpoint to manage user registration. It allows new users to register and
   * returns a structured registration response.
   * 
   * Throttling is similarly applied to protect the endpoint from high traffic and potential abuse.
   * - Limit: 6 attempts per 60 seconds.
   *
   * @param userRegisterDto - The data transfer object containing user registration details.
   * @returns A Promise resolving to a RegisterResponseDto that includes user registration details.
   */
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
