import { ApiPropertyOptional } from '@nestjs/swagger';

import { CatDto } from './CatDto';

export class CatCreateResponseDto {
  @ApiPropertyOptional({ type: CatDto })
  cat?: CatDto;

  constructor(data: { cat?: CatDto; }) {
    this.cat = data.cat;
  }
}
