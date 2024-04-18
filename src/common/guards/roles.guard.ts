import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import type { UserEntity } from '../../users/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = <UserEntity>request.user;

    return roles.includes(user.role);
  }
}
