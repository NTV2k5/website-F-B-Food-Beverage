import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Trà Sữa', description: 'Category name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'tra-sua', description: 'Unique category slug' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ example: 'Các loại trà sữa thơm ngon đậm vị', description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69', description: 'Category image URL' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ example: 0, minimum: 0, description: 'Display order priority' })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ example: true, description: 'Is category active and visible' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Trà Sữa', description: 'Category name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'tra-sua', description: 'Unique category slug' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: 'Các loại trà sữa thơm ngon đậm vị', description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69', description: 'Category image URL' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ example: 0, minimum: 0, description: 'Display order priority' })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ example: true, description: 'Is category active and visible' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
