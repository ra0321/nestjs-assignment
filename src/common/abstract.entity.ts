import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UtilsService } from 'src/common/providers/utils.service';
import type { AbstractDto } from './dto/AbstractDto';

export abstract class AbstractEntity<T extends AbstractDto = AbstractDto> {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({
    type: 'timestamp without time zone',
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp without time zone',
    name: 'updated_at',
  })
  updatedAt: Date;

  abstract dtoClass: new (entity: AbstractEntity, options?: any) => T;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  toDto(options?: any) {
    return UtilsService.toDto(this.dtoClass, this, options);
  }
}
