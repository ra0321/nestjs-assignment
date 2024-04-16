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
// import { ParseIntPipe } from '../common/pipes/parse-int.pipe';
import { CatsService } from './cats.service';
import { CatCreateRequestDto } from './dto/CatCreateRequestDto';
import { CatCreateResponseDto } from './dto/CatCreateResponseDto';


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

  // @Get()
  // async findAll(): Promise<Cat[]> {
  //   return this.catsService.findAll();
  // }

  // @Get(':id')
  // findOne(
  //   @Param('id', new ParseIntPipe())
  //   id: number,
  // ) {
  //   // get by ID logic
  // }
}
