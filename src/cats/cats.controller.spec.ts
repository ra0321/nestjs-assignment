import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { CatsController } from './cats.controller';
import { CatDto } from './dto/CatDto';
import { CatEntity } from './cat.entity';
import { CatsService } from './cats.service';

import { CatCreateRequestDto } from './dto/CatCreateRequestDto';
import { CatCreateResponseDto } from './dto/CatCreateResponseDto';
import { CatUpdateRequestDto } from './dto/CatUpdateRequestDto';
import { CatUpdateResponseDto } from './dto/CatUpdateResponseDto';
import { CatGetResponseDto } from './dto/CatGetResponseDto';

const testCat1 = 'Test Cat 1';
const testBreed1 = 'Test Breed 1';

const oneCatEntity = new CatEntity({name: testCat1, breed: testBreed1, age: 4});

describe('Cats Controller', () => {
  let controller: CatsController;
  let service: CatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatsController],
      providers: [
        CatsService,
        {
          provide: getRepositoryToken(CatEntity),
          useValue: {
            find: jest.fn().mockResolvedValue([
              new CatEntity({name: testCat1, breed: testBreed1, age: 4}),
              new CatEntity({name: 'Test Cat 2', breed: 'Test Breed 2', age: 3}),
              new CatEntity({name: 'Test Cat 3', breed: 'Test Breed 3', age: 2}),
            ]),
            findOne: jest.fn().mockResolvedValue(oneCatEntity),
            create: jest.fn().mockReturnValue(oneCatEntity),
            save: jest.fn().mockResolvedValue(oneCatEntity),
            update: jest.fn().mockResolvedValue(true),
            delete: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    controller = module.get<CatsController>(CatsController);
    service = module.get<CatsService>(CatsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should get an array of cats', async () => {
      await expect(controller.findAll()).resolves.toEqual([
        new CatEntity({name: testCat1, breed: testBreed1, age: 4}).toDto(),
        new CatEntity({name: 'Test Cat 2', breed: 'Test Breed 2', age: 3}).toDto(),
        new CatEntity({name: 'Test Cat 3', breed: 'Test Breed 3', age: 2}).toDto(),
      ]);
    });
  });
  describe('findOneById', () => {
    it('should get a single cat', async () => {
      await expect(controller.findOneById(1)).resolves.toEqual(
        new CatGetResponseDto({cat: oneCatEntity.toDto()})
      );
      await expect(controller.findOneById(2)).resolves.toEqual(
        new CatGetResponseDto({cat: oneCatEntity.toDto()})
      );
    });
  });
  describe('create', () => {
    it('should create a new cat', async () => {
      await expect(controller.create(new CatCreateRequestDto({name: testCat1, breed: testBreed1, age: 4}))).resolves.toEqual(
        new CatCreateResponseDto({cat: oneCatEntity.toDto()})
      );
    });
  });
  describe('update', () => {
    it('should update a cat', async () => {
      await expect(controller.update(1, new CatUpdateRequestDto({name: testCat1, breed: testBreed1, age: 4}))).resolves.toEqual(
        new CatUpdateResponseDto({cat: oneCatEntity.toDto()})
      );
    });
  });
  describe('delete', () => {
    it('should return {deleted: true}', async () => {
      await expect(controller.delete(1)).resolves.toEqual({deleted: true});
    });
    it('should return {deleted: false, message: err.message}', async () => {
      const deleteSpy = jest
        .spyOn(service, 'delete')
        .mockResolvedValueOnce({ deleted: false, message: 'Bad Delete Method.' });
      await expect(
        controller.delete(1)
      ).resolves.toEqual({ deleted: false, message: 'Bad Delete Method.' });
      expect(deleteSpy).toBeCalledWith(1);
    });
  });
});