import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  CreateProductDto,
  ProductQueryDto,
  UpdateProductDto,
} from './dto/product.dto';
import { ProductsService } from './products.service';

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
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findBestsellers(@Query('limit') limit?: string) {
    return this.productsService.findBestsellers(limit ? parseInt(limit, 10) : 8);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get product by slug with options' })
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create product (admin)' })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Patch(':id/availability')
  @ApiOperation({ summary: 'Toggle product availability (admin)' })
  toggleAvailability(
    @Param('id') id: string,
    @Body('isAvailable') isAvailable: boolean,
  ) {
    return this.productsService.toggleAvailability(id, isAvailable);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product (admin)' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
