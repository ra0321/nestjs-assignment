import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { FindOptionsWhere } from 'typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from './user.entity';
import type { UserDto } from './dto/UserDto';
import type { UserRegisterDto } from '../auth/dto/UserRegisterDto';
import { UtilsService } from '../common/providers/utils.service';

/**
 * Injectable UsersService class to handle all user-related operations.
 * This service manages user data interactions and transforms entity data
 * into transferable Data Transfer Objects (DTOs).
 */
@Injectable()
export class UsersService {
  /**
   * Constructor to inject the UserRepository.
   * @param usersRepository The repository for user entity, used for database operations.
   */
  constructor(
    @InjectRepository(UserEntity)
    public usersRepository: Repository<UserEntity>,
  ) {}

  /**
   * Finds a single user entity based on a set of criteria.
   * @param where Conditions to find the user.
   * @returns A promise resolved with the User entity if found, else null.
   */
  async findOne(
    where: FindOptionsWhere<UserDto>,
  ): Promise<UserEntity> {
    return this.usersRepository.findOne({ where });
  }

  /**
   * Retrieves all users from the repository, and maps them to UserDto objects.
   * @returns A promise resolved with an array of UserDto.
   */
  async getUsers(): Promise<UserDto[]> {
    const users = await this.usersRepository.find({});

    return users.map((user) => user.toDto());
  }

  /**
   * Creates a new user with the provided user data from the registration process.
   * Hashes the user password before saving to the database.
   * @param user The user registration DTO containing the new user's data.
   * @returns A promise resolved with the newly created User entity.
   */
  async create(user: UserRegisterDto): Promise<UserEntity> {
    const userData = await this.usersRepository.create(user);
    userData.password = UtilsService.generateHash(user.password);

    return this.usersRepository.save(userData);
  }
}
