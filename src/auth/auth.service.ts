import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { UserEntity } from 'src/users/user.entity';
import { UtilsService } from 'src/common/providers/utils.service';

import { UsersService } from '../users/users.service';
import type { UserLoginDto } from './dto/UserLoginDto';
import type { UserRegisterDto } from './dto/UserRegisterDto';
import { LoginResponseDto } from './dto/LoginResponseDto';
import { RegisterResponseDto } from './dto/RegisterResponseDto';
import { TokenResponseDto } from './dto/TokenResponseDto';

import { UserAlreadyExistException } from 'src/common/exceptions/UserAlreadyExistException';

@Injectable()
export class AuthService {
  constructor(
    public readonly jwtService: JwtService,
    public readonly configService: ConfigService,
    public readonly usersService: UsersService,
  ) {}

  async createToken(user: { id: number }): Promise<TokenResponseDto> {
    return new TokenResponseDto({
      expiresIn: this.configService.get<number>('JWT_EXPIRATION_TIME'),
      accessToken: await this.jwtService.signAsync({
        id: user.id,
      }),
    });
  }

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

  async login(userLoginDto: UserLoginDto): Promise<LoginResponseDto> {
    const userEntity = await this.validateUser(userLoginDto);

    try {
      const token = await this.createToken(userEntity);

      return new LoginResponseDto({ user: userEntity.toDto(), token });
    } catch {
      throw new UnauthorizedException();
    }
  }

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
