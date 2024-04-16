import { ApiPropertyOptional } from '@nestjs/swagger';

import { CatDto } from './CatDto';

export class CatGetResponseDto {
  @ApiPropertyOptional({ type: CatDto })
  cat?: CatDto;

  constructor(data: { cat?: CatDto; }) {
    this.cat = data.cat;
  }
}
