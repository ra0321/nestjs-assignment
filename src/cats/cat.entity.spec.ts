import { CatEntity } from './cat.entity';

describe('Cat entity class', () => {
  it('should make a cat with no fields', () => {
    const catEntity = new CatEntity({});
    expect(catEntity).toBeTruthy();
    expect(catEntity.name).toBe('');
    expect(catEntity.breed).toBe('');
    expect(catEntity.age).toBe(NaN);
  });
  it('should make a cat with name only', () => {
    const cat = new CatEntity({name: 'Test'});
    expect(cat).toBeTruthy();
    expect(cat.name).toBe('Test');
    expect(cat.breed).toBe('');
    expect(cat.age).toBe(NaN);
  });
  it('should make a cat with name and breed', () => {
    const cat = new CatEntity({name: 'Test', breed: 'Breed'});
    expect(cat).toBeTruthy();
    expect(cat.name).toBe('Test');
    expect(cat.breed).toBe('Breed');
    expect(cat.age).toBe(NaN);
  });
  it('should make a cat with name breed and age', () => {
    const cat = new CatEntity({name: 'Test', breed: 'Breed', age: 4});
    expect(cat).toBeTruthy();
    expect(cat.name).toBe('Test');
    expect(cat.breed).toBe('Breed');
    expect(cat.age).toBe(4);
  });
});