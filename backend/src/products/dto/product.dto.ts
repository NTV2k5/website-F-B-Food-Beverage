import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductOptionDto {
  @ApiProperty({ example: 'Trân châu đen', description: 'Option name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 5000, minimum: 0, description: 'Extra price in VND for this option' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  extraPrice?: number;

  @ApiPropertyOptional({ example: true, description: 'Is option currently available' })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ example: 0, minimum: 0, description: 'Display order priority' })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class CreateProductOptionGroupDto {
  @ApiProperty({ example: 'Topping', description: 'Option group name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: false, description: 'Is selection required' })
  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @ApiPropertyOptional({ example: 0, minimum: 0, description: 'Minimum number of items to select' })
  @IsOptional()
  @IsInt()
  @Min(0)
  minSelect?: number;

  @ApiPropertyOptional({ example: 3, minimum: 1, description: 'Maximum number of items to select' })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxSelect?: number;

  @ApiPropertyOptional({ example: 0, minimum: 0, description: 'Display order priority' })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ type: [CreateProductOptionDto], description: 'Options under this group' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductOptionDto)
  options?: CreateProductOptionDto[];
}

export class CreateProductDto {
  @ApiProperty({ example: 'Trà sữa Trân Châu', description: 'Product name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'tra-sua-tran-chau', description: 'Product slug' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ example: 'Trà sữa truyền thống kèm trân châu dai giòn', description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 35000, minimum: 0, description: 'Base price in VND' })
  @IsNumber()
  @Min(0)
  basePrice: number;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69', description: 'Main product image URL' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ type: [String], example: ['image1.jpg', 'image2.jpg'], description: 'Additional product images' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ example: 'clxxx-category-id', description: 'Category ID' })
  @IsString()
  categoryId: string;

  @ApiPropertyOptional({ example: true, description: 'Is product available' })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Is product featured' })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: 0, minimum: 0, description: 'Display order priority' })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ type: [CreateProductOptionGroupDto], description: 'Option groups' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductOptionGroupDto)
  optionGroups?: CreateProductOptionGroupDto[];
}

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Trà sữa Trân Châu', description: 'Product name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'tra-sua-tran-chau', description: 'Product slug' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: 'Trà sữa truyền thống kèm trân châu dai giòn', description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 35000, minimum: 0, description: 'Base price in VND' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @ApiPropertyOptional({ example: 'image.jpg', description: 'Main product image URL' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ type: [String], example: ['image1.jpg'], description: 'Additional product images' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ example: 'category-id', description: 'Category ID' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ example: true, description: 'Is product available' })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Is product featured' })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: 0, minimum: 0, description: 'Display order priority' })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class ProductQueryDto {
  @ApiPropertyOptional({ example: 'tra-sua', description: 'Category slug' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'clxxx-category-id', description: 'Category ID' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ example: 0, minimum: 0, description: 'Min price filter' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ example: 100000, minimum: 0, description: 'Max price filter' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ enum: ['price_asc', 'price_desc', 'newest', 'bestseller'], example: 'newest', description: 'Sort criteria' })
  @IsOptional()
  @IsString()
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'bestseller';

  @ApiPropertyOptional({ example: true, description: 'Featured filter' })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({ example: 1, minimum: 1, description: 'Page number for pagination' })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 10, minimum: 1, description: 'Items per page limit' })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ example: 'Trà sữa', description: 'Search query' })
  @IsOptional()
  @IsString()
  search?: string;
}
