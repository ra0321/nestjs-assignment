import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { FindOptionsWhere } from 'typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from './user.entity';
import type { UserDto } from './dto/UserDto';
import type { UserRegisterDto } from '../auth/dto/UserRegisterDto';
import { UtilsService } from 'src/common/providers/utils.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    public usersRepository: Repository<UserEntity>,
  ) {}

  async findOne(
    where: FindOptionsWhere<UserDto>,
  ): Promise<UserEntity> {
    return this.usersRepository.findOne({ where });
  }

  async getUsers(): Promise<UserDto[]> {
    const users = await this.usersRepository.find({});

    return users.map((user) => user.toDto());
  }

  async create(user: UserRegisterDto): Promise<UserEntity> {
    const userData = await this.usersRepository.create(user);
    userData.password = UtilsService.generateHash(user.password);

    return this.usersRepository.save(userData);
  }
}
