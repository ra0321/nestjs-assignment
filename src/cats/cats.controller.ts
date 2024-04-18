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

// Controller handling all routes related to cats, secured with authentication and role-based guards.
@Controller('cats')
@ApiTags('cats') // Tag used for API documentation grouping.
@UseGuards(AuthGuard, RolesGuard) // Applies Guards that check for authentication and role authorization.
@ApiBearerAuth() // Indicates that methods in this controller use Bearer Token authentication.
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  // Method to create a new cat profile.
  @Post()
  @Roles(UserRole.Admin) // Restricts access to Admin users only.
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

  // Method to retrieve all cat profiles.
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

  // Method to retrieve a specific cat profile by ID.
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

  // Method to update a cat profile by ID.
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

  // Method to delete a cat profile by ID.
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
    @Param('id', new ParseIntPipe()) id: number): Promise<{ deleted: boolean }> {
    return this.catsService.delete(id);
  }
}
