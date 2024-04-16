import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from 'src/common/constants/user-roles';
import { AbstractDto } from 'src/common/dto/AbstractDto';

import type { UserEntity } from '../user.entity';

export class UserDto extends AbstractDto {
  @ApiPropertyOptional()
  name: string;

  @ApiPropertyOptional()
  email: string;

  @ApiPropertyOptional({ enum: UserRole })
  role: UserRole;

  constructor(user: UserEntity) {
    super(user);

    this.name = user.name;
    this.email = user.email;
    this.role = user.role;
  }
}
