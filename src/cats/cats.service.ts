import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CatEntity } from './cat.entity';
import type { CatCreateRequestDto } from './dto/CatCreateRequestDto';
import type { CatUpdateRequestDto } from './dto/CatUpdateRequestDto';
import { CatCreateResponseDto } from './dto/CatCreateResponseDto';
import { CatUpdateResponseDto } from './dto/CatUpdateResponseDto';
import { CatDto } from './dto/CatDto';

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

  async findAll(): Promise<CatDto[]> {
    const list = await this.catsRepository.find({ order: { id: 'ASC' } });

    return list.map((item) => item.toDto());
  }

  async findOneById(id: number): Promise<CatDto> {
    const entity = await this.catsRepository.findOne({ where: { id }});
    
    return entity?.toDto();
  }

  async update(id: number, data: CatUpdateRequestDto): Promise<CatUpdateResponseDto> {
    const entity = await this.findOneById(id);

    if (!entity) throw new NotFoundException();

    try {
      await this.catsRepository.update(id, data);

      const cat = await this.findOneById(id);

      return new CatUpdateResponseDto({ cat });
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async delete(id: number): Promise<{ deleted: boolean, message?: string }> {
    const entity = await this.findOneById(id);

    if (!entity) throw new NotFoundException();

    try {
      await this.catsRepository.delete(id);
      
      return { deleted: true };
    } catch (err) {
      return { deleted: false, message: err.message };
    }
  }
}
