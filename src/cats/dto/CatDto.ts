import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

import { AbstractDto } from 'src/common/dto/AbstractDto';

import type { CatEntity } from '../cat.entity';

export class CatDto extends AbstractDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsNumber()
  @ApiPropertyOptional()
  age?: number;

  @IsString()
  @ApiPropertyOptional()
  breed?: string;

  constructor(cat: CatEntity) {
    super(cat);

    this.name = cat.name;
    this.age = cat.age;
    this.breed = cat.breed;
  }
}
