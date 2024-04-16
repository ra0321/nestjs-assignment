import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { FindOptionsWhere } from 'typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from './user.entity';
import type { UserDto } from './dto/UserDto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    public readonly usersRepository: Repository<UserEntity>,
  ) {}

  async findOne(
    where: FindOptionsWhere<UserEntity>,
  ): Promise<UserEntity> {
    return this.usersRepository.findOne({ where });
  }

  async getUsers(): Promise<UserDto[]> {
    const users = await this.usersRepository.find({});

    return users.map((user) => user.toDto());
  }
}
