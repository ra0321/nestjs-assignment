import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { UserRole } from '../common/constants/user-roles';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ParseIntPipe } from '../common/pipes/parse-int.pipe';
import { CatsService } from './cats.service';
import { CatCreateRequestDto } from './dto/CatCreateRequestDto';
import { CatCreateResponseDto } from './dto/CatCreateResponseDto';
import { CatGetResponseDto } from './dto/CatGetResponseDto';
import { CatDto } from './dto/CatDto';


@Controller('cats')
@ApiTags('cats')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Post()
  @Roles(UserRole.Admin)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Create',
    description: 'Create a new cat profile.',
  })
  @ApiOkResponse({
    type: CatCreateResponseDto,
  })
  async create(@Body() catCreateRequestDto: CatCreateRequestDto): Promise<CatCreateResponseDto> {
    return this.catsService.create(catCreateRequestDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List',
    description: 'Retrieve a list of all cats.',
  })
  @ApiOkResponse({
    type: CatDto,
    isArray: true
  })
  async getList(): Promise<CatDto[]> {
    return this.catsService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get',
    description: 'Get a cat profile.',
  })
  @ApiOkResponse({
    type: CatGetResponseDto
  })
  async getOne(
    @Param('id', new ParseIntPipe())
    id: number,
  ): Promise<CatGetResponseDto> {
    const cat = await this.catsService.findOne(id);

    return new CatGetResponseDto({ cat });
  }
}
