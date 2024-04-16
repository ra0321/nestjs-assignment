import { ApiPropertyOptional } from '@nestjs/swagger';

import { UserDto } from '../../users/dto/UserDto';

export class RegisterResponseDto {
  @ApiPropertyOptional({ type: UserDto })
  user?: UserDto;

  constructor(data: { user?: UserDto; }) {
    this.user = data.user;
  }
}
