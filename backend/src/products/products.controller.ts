import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiParam, ApiBody, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  CreateProductDto,
  ProductQueryDto,
  UpdateProductDto,
} from './dto/product.dto';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List products with filters' })
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get('bestsellers')
  @ApiOperation({ summary: 'Get bestselling products' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit results count' })
  findBestsellers(@Query('limit') limit?: string) {
    return this.productsService.findBestsellers(limit ? parseInt(limit, 10) : 8);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get product by slug with options' })
  @ApiParam({ name: 'slug', description: 'Product slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create product (admin)' })
  @ApiBody({ type: CreateProductDto })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update product (admin)' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiBody({ type: UpdateProductDto })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Patch(':id/availability')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Toggle product availability (admin)' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiBody({ schema: { type: 'object', properties: { isAvailable: { type: 'boolean', example: true } } } })
  toggleAvailability(
    @Param('id') id: string,
    @Body('isAvailable') isAvailable: boolean,
  ) {
    return this.productsService.toggleAvailability(id, isAvailable);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete product (admin)' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
