import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { UserEntity } from '../users/user.entity';
import { UtilsService } from '../common/providers/utils.service';

import { UsersService } from '../users/users.service';
import type { UserLoginDto } from './dto/UserLoginDto';
import type { UserRegisterDto } from './dto/UserRegisterDto';
import { LoginResponseDto } from './dto/LoginResponseDto';
import { RegisterResponseDto } from './dto/RegisterResponseDto';
import { TokenResponseDto } from './dto/TokenResponseDto';

import { UserAlreadyExistException } from '../common/exceptions/UserAlreadyExistException';

@Injectable()
export class AuthService {
  /**
   * Constructs the authentication service with necessary dependencies.
   * 
   * @param jwtService Service for handling JWT operations such as signing tokens.
   * @param configService Service to access application configurations like JWT expiration.
   * @param usersService Service to handle database operations related to users.
   */
  constructor(
    public readonly jwtService: JwtService,
    public readonly configService: ConfigService,
    public readonly usersService: UsersService,
  ) {}

  /**
   * Creates a JWT token for a user.
   * 
   * @param user An object containing the user ID.
   * @returns A promise that resolves to a TokenResponseDto.
   */
  async createToken(user: { id: number }): Promise<TokenResponseDto> {
    return new TokenResponseDto({
      expiresIn: this.configService.get<number>('JWT_EXPIRATION_TIME'),
      accessToken: await this.jwtService.signAsync({
        id: user.id,
      }),
    });
  }

  /**
   * Validates a user's email and password.
   * 
   * @param data An object containing email and password.
   * @throws UnauthorizedException If no user is found or the password is invalid.
   * @returns A promise that resolves to the user entity.
   */
  async validateUser(data: {
    email: string;
    password: string;
  }): Promise<UserEntity> {
    const user = await this.usersService.findOne({
      email: data.email,
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const isPasswordValid = await UtilsService.validateHash(
      data.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }

    return user;
  }

  /**
   * Checks if a user exists in the database based on email.
   * 
   * @param data An object containing the user's email.
   * @returns A promise that resolves to a boolean indicating if the user exists.
   */
  async checkUserExist(data: {
    email: string;
  }): Promise<boolean> {
    const user = await this.usersService.findOne({
      email: data.email,
    });

    if (!user) {
      return false;
    }

    return true;
  }

  /**
   * Handles the login process for a user.
   * 
   * @param userLoginDto Data Transfer Object containing login information.
   * @throws UnauthorizedException If authentication fails.
   * @returns A promise that resolves to a LoginResponseDto.
   */
  async login(userLoginDto: UserLoginDto): Promise<LoginResponseDto> {
    const userEntity = await this.validateUser(userLoginDto);

    try {
      const token = await this.createToken(userEntity);

      return new LoginResponseDto({ user: userEntity.toDto(), token });
    } catch {
      throw new UnauthorizedException();
    }
  }

  /**
   * Handles the registration of a new user.
   * 
   * @param userRegisterDto Data Transfer Object containing registration information.
   * @throws UserAlreadyExistException If the email is already in use.
   * @throws InternalServerErrorException If there is a database error.
   * @returns A promise that resolves to a RegisterResponseDto.
   */
  async register(userRegisterDto: UserRegisterDto): Promise<RegisterResponseDto> {
    const userExist = await this.checkUserExist(userRegisterDto);

    if (userExist) throw new UserAlreadyExistException();

    try {
      const userEntity = await this.usersService.create(userRegisterDto);

      return new RegisterResponseDto({ user: userEntity.toDto() });
    } catch {
      throw new InternalServerErrorException();
    }
  }
}
