import type { CustomDecorator } from '@nestjs/common';
import { SetMetadata } from '@nestjs/common';

import type { UserRole } from '../constants/user-roles';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Roles = (...roles: UserRole[]): CustomDecorator<any> =>
  SetMetadata('roles', roles);
