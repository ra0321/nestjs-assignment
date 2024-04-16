import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CatEntity } from './cat.entity';
import type { CatCreateRequestDto } from './dto/CatCreateRequestDto';
import { CatCreateResponseDto } from './dto/CatCreateResponseDto';

@Injectable()
export class CatsService {
  constructor(
    @InjectRepository(CatEntity)
    public catsRepository: Repository<CatEntity>,
  ) {}

  async create(data: CatCreateRequestDto): Promise<CatCreateResponseDto> {
    try {
      const cat = await this.catsRepository.create(data);
      const entity = await this.catsRepository.save(cat);

      return new CatCreateResponseDto({ cat: entity.toDto() });
    } catch {
      throw new InternalServerErrorException();
    }
  }

  // findAll(): Cat[] {
  //   return this.cats;
  // }
}
