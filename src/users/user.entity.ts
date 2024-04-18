import { AbstractEntity } from '../common/abstract.entity';
import {
  Entity,
  Column,
} from 'typeorm';

import { UserRole } from '../common/constants/user-roles';
import { UserDto } from './dto/UserDto';

@Entity({ name: 'users' })
export class UserEntity extends AbstractEntity<UserDto> {
  @Column({ nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 1024, default: '', unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 2048, default: '', nullable: true })
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  dtoClass = UserDto;
}
