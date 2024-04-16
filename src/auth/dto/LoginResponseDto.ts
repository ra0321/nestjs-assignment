import { ApiPropertyOptional } from '@nestjs/swagger';

import { UserDto } from '../../users/dto/UserDto';
import { TokenResponseDto } from './TokenResponseDto';

export class LoginResponseDto {
  @ApiPropertyOptional({ type: UserDto })
  user?: UserDto;

  @ApiPropertyOptional({ type: TokenResponseDto })
  token?: TokenResponseDto;

  constructor(data: { user?: UserDto; token?: TokenResponseDto }) {
    this.user = data.user;
    this.token = data.token;
  }
}
