import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CatEntity } from './cat.entity';
import type { CatCreateRequestDto } from './dto/CatCreateRequestDto';
import type { CatUpdateRequestDto } from './dto/CatUpdateRequestDto';
import { CatCreateResponseDto } from './dto/CatCreateResponseDto';
import { CatUpdateResponseDto } from './dto/CatUpdateResponseDto';
import { CatDto } from './dto/CatDto';

/**
 * Service to handle all operations related to Cats.
 * Uses dependency injection to include the repository handling Cat entities.
 */
@Injectable()
export class CatsService {
  /**
   * Constructor to inject repository of cat entities.
   * @param {Repository<CatEntity>} catsRepository The repository for the cat entity.
   */
  constructor(
    @InjectRepository(CatEntity)
    public catsRepository: Repository<CatEntity>,
  ) {}

  /**
   * Creates a new cat record.
   * @param {CatCreateRequestDto} data The creation data for a new cat.
   * @returns {Promise<CatCreateResponseDto>} A promise that resolves to the creation response data transfer object.
   * @throws {InternalServerErrorException} When the operation fails.
   */
  async create(data: CatCreateRequestDto): Promise<CatCreateResponseDto> {
    try {
      const cat = this.catsRepository.create(data);
      const entity = await this.catsRepository.save(cat);
      return new CatCreateResponseDto({ cat: entity.toDto() });
    } catch {
      throw new InternalServerErrorException();
    }
  }

  /**
   * Retrieves all cats sorted by their ID in ascending order.
   * @returns {Promise<CatDto[]>} A promise that resolves to an array of cat data transfer objects.
   */
  async findAll(): Promise<CatDto[]> {
    const list = await this.catsRepository.find({ order: { id: 'ASC' } });
    return list.map((item) => item.toDto());
  }

  /**
   * Finds a single cat by its ID.
   * @param {number} id The unique identifier of the cat.
   * @returns {Promise<CatDto>} A promise that resolves to the data transfer object of the cat.
   */
  async findOneById(id: number): Promise<CatDto> {
    const entity = await this.catsRepository.findOne({ where: { id }});
    return entity?.toDto();
  }

  /**
   * Updates a cat record by its ID.
   * @param {number} id The ID of the cat to update.
   * @param {CatUpdateRequestDto} data The update data.
   * @returns {Promise<CatUpdateResponseDto>} A promise that resolves to the update response data transfer object.
   * @throws {InternalServerErrorException} When the update operation fails.
   */
  async update(id: number, data: CatUpdateRequestDto): Promise<CatUpdateResponseDto> {
    try {
      await this.catsRepository.update(id, data);
      const cat = await this.findOneById(id);
      return new CatUpdateResponseDto({ cat });
    } catch {
      throw new InternalServerErrorException();
    }
  }

  /**
   * Deletes a cat record by its ID.
   * @param {number} id The ID of the cat to delete.
   * @returns {Promise<{deleted: boolean, message?: string}>} A promise that resolves to an object indicating the deletion success or failure.
   */
  async delete(id: number): Promise<{ deleted: boolean, message?: string }> {
    try {
      await this.catsRepository.delete(id);
      return { deleted: true };
    } catch (err) {
      return { deleted: false, message: err.message };
    }
  }
}
