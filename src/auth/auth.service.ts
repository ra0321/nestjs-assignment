import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { UserEntity } from 'src/users/user.entity';
import { UtilsService } from 'src/common/providers/utils.service';

import { UsersService } from '../users/users.service';
import type { UserLoginDto } from './dto/UserLoginDto';
import { LoginResponseDto } from './dto/LoginResponseDto';
import { TokenResponseDto } from './dto/TokenResponseDto';

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

  async login(userLoginDto: UserLoginDto): Promise<LoginResponseDto> {
    const userEntity = await this.validateUser(userLoginDto);

    try {
      const token = await this.createToken(userEntity);

      return new LoginResponseDto({ user: userEntity.toDto(), token });
    } catch {
      throw new UnauthorizedException();
    }
  }
}
