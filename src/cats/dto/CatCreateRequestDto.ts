import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CatCreateRequestDto {
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

  constructor(data: { name?: string, age?: number, breed?: string}) {
    this.name = data?.name || '';
    this.age = data?.age || NaN;
    this.breed = data?.breed || '';
  }
}
