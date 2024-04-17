import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';

import { UserRole } from '../common/constants/user-roles';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ParseIntPipe } from '../common/pipes/parse-int.pipe';
import { CatsService } from './cats.service';
import { CatCreateRequestDto } from './dto/CatCreateRequestDto';
import { CatUpdateRequestDto } from './dto/CatUpdateRequestDto';
import { CatCreateResponseDto } from './dto/CatCreateResponseDto';
import { CatUpdateResponseDto } from './dto/CatUpdateResponseDto';
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
  @HttpCode(HttpStatus.UNAUTHORIZED)
  @HttpCode(HttpStatus.FORBIDDEN)
  @HttpCode(HttpStatus.INTERNAL_SERVER_ERROR)
  @ApiOperation({
    summary: 'Create',
    description: 'Create a new cat profile.',
  })
  @ApiOkResponse({
    type: CatCreateResponseDto,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiInternalServerErrorResponse()
  async create(@Body() catCreateRequestDto: CatCreateRequestDto): Promise<CatCreateResponseDto> {
    return this.catsService.create(catCreateRequestDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @HttpCode(HttpStatus.UNAUTHORIZED)
  @ApiOperation({
    summary: 'List',
    description: 'Retrieve a list of all cats.',
  })
  @ApiOkResponse({
    type: CatDto,
    isArray: true
  })
  @ApiUnauthorizedResponse()
  async findAll(): Promise<CatDto[]> {
    return this.catsService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @HttpCode(HttpStatus.UNAUTHORIZED)
  @ApiOperation({
    summary: 'Get',
    description: 'Get a cat profile.',
  })
  @ApiOkResponse({
    type: CatGetResponseDto
  })
  @ApiUnauthorizedResponse()
  async findOneById(
    @Param('id', new ParseIntPipe())
    id: number,
  ): Promise<CatGetResponseDto> {
    const cat = await this.catsService.findOneById(id);

    return new CatGetResponseDto({ cat });
  }

  @Put(':id')
  @Roles(UserRole.Admin)
  @HttpCode(HttpStatus.OK)
  @HttpCode(HttpStatus.UNAUTHORIZED)
  @HttpCode(HttpStatus.FORBIDDEN)
  @ApiOperation({
    summary: 'Update',
    description: 'Update a cat profile.',
  })
  @ApiOkResponse({
    type: CatUpdateResponseDto,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  async update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() catUpdateRequestDto: CatUpdateRequestDto): Promise<CatUpdateResponseDto> {
    return this.catsService.update(id, catUpdateRequestDto);
  }

  @Delete(':id')
  @Roles(UserRole.Admin)
  @HttpCode(HttpStatus.OK)
  @HttpCode(HttpStatus.UNAUTHORIZED)
  @HttpCode(HttpStatus.FORBIDDEN)
  @ApiOperation({
    summary: 'Delete',
    description: 'Delete a cat profile.',
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  async delete(
    @Param('id', new ParseIntPipe()) id: number): Promise<void> {
    return this.catsService.delete(id);
  }
}
