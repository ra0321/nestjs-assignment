import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CatUpdateRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly name: string;

  @IsNumber()
  @ApiPropertyOptional()
  readonly age?: number;

  @IsString()
  @ApiPropertyOptional()
  readonly breed?: string;
}
