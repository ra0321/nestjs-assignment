import { AbstractEntity } from 'src/common/abstract.entity';
import {
  Entity,
  Column,
} from 'typeorm';

import { CatDto } from './dto/CatDto';

@Entity({ name: 'cats' })
export class CatEntity extends AbstractEntity<CatDto> {
  @Column({ nullable: false })
  name: string;

  @Column({ type: 'decimal', nullable: true })
  age: number;

  @Column({ type: 'varchar', length: 1024, default: '', nullable: true })
  breed: string;

  dtoClass = CatDto;
}
