import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CatDto } from './dto/CatDto';
import { CatEntity } from './cat.entity';
import { CatsService } from './cats.service';
import { CatCreateRequestDto } from './dto/CatCreateRequestDto';
import { CatCreateResponseDto } from './dto/CatCreateResponseDto';
import { CatUpdateRequestDto } from './dto/CatUpdateRequestDto';
import { CatUpdateResponseDto } from './dto/CatUpdateResponseDto';

const testCat1 = 'Test Cat 1';
const testBreed1 = 'Test Breed 1';

const catEntityArray = [
  new CatEntity({name: testCat1, breed: testBreed1, age: 4}),
  new CatEntity({name: 'Test Cat 2', breed: 'Test Breed 2', age: 3}),
  new CatEntity({name: 'Test Cat 3', breed: 'Test Breed 3', age: 2}),
];

const catDtoArray = [
  new CatDto(new CatEntity({name: testCat1, breed: testBreed1, age: 4})),
  new CatDto(new CatEntity({name: 'Test Cat 2', breed: 'Test Breed 2', age: 3})),
  new CatDto(new CatEntity({name: 'Test Cat 3', breed: 'Test Breed 3', age: 2})),
];

const oneCatEntity = new CatEntity({name: testCat1, breed: testBreed1, age: 4});
const oneCatCreateRequestDto = new CatCreateRequestDto({name: testCat1, breed: testBreed1, age: 4});
const oneCatCreateResponseDto = new CatCreateResponseDto({cat: oneCatEntity.toDto()});
const oneCatUpdateRequestDto = new CatUpdateRequestDto({name: testCat1, breed: testBreed1, age: 4});
const oneCatUpdateResponseDto = new CatUpdateResponseDto({cat: oneCatEntity.toDto()});

describe('CatsService', () => {
  let service: CatsService;
  let repo: Repository<CatEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatsService,
        {
          provide: getRepositoryToken(CatEntity),
          // define all the methods that you use from the catsRepository
          // give proper return values as expected or mock implementations, your choice
          useValue: {
            find: jest.fn().mockResolvedValue(catEntityArray),
            findOne: jest.fn().mockResolvedValue(oneCatEntity),
            create: jest.fn().mockReturnValue(oneCatEntity),
            save: jest.fn().mockResolvedValue(oneCatEntity),
            update: jest.fn().mockResolvedValue(true),
            delete: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<CatsService>(CatsService);
    repo = module.get<Repository<CatEntity>>(getRepositoryToken(CatEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('findAll', () => {
    it('should return an array of cats', async () => {
      const cats = await service.findAll();
      expect(cats).toEqual(catDtoArray);
    });
  });
  describe('findOneById', () => {
    it('should get a single cat', () => {
      const repoSpy = jest.spyOn(repo, 'findOne');
      expect(service.findOneById(1)).resolves.toEqual(oneCatEntity.toDto());
      expect(repoSpy).toBeCalledWith({ where: { id: 1 } });
    });
  });
  describe('create', () => {
    it('should successfully create a cat', async () => {
      expect(
        service.create(oneCatCreateRequestDto)
      ).resolves.toEqual(oneCatCreateResponseDto);
      expect(repo.create).toBeCalledTimes(1);
      expect(repo.create).toBeCalledWith(oneCatCreateRequestDto);
      expect(repo.save).toBeCalledTimes(1);
    });
  });
  describe('update', () => {
    it('should successfully update a cat', async () => {
      expect(
        service.update(1, oneCatUpdateRequestDto)
      ).resolves.toEqual(oneCatUpdateResponseDto);
      expect(repo.update).toBeCalledTimes(1);
      expect(repo.update).toBeCalledWith(
        1,
        oneCatUpdateRequestDto,
      );
    });
  });
  describe('delete', () => {
    it('should return {deleted: true}', () => {
      expect(service.delete(1)).resolves.toEqual({ deleted: true });
    });
    it('should return {deleted: false, message: err.message}', () => {
      const repoSpy = jest
        .spyOn(repo, 'delete')
        .mockRejectedValueOnce(new Error('Bad Delete Method.'));
      expect(service.delete(2)).resolves.toEqual({
        deleted: false,
        message: 'Bad Delete Method.',
      });
      expect(repoSpy).toBeCalledWith(2);
      expect(repoSpy).toBeCalledTimes(1);
    });
  });
});