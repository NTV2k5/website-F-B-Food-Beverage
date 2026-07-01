import { IsString, IsInt, IsOptional, Min, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class SelectedOptionDto {
  @ApiProperty({ example: 'clxxx-group-id', description: 'Group ID of option (size, topping etc.)' })
  @IsString()
  groupId: string;

  @ApiProperty({ example: 'clxxx-option-id', description: 'Option ID' })
  @IsString()
  optionId: string;
}

export class AddToCartDto {
  @ApiProperty({ example: 'clxxx-product-id', description: 'ID of the product to add' })
  @IsString()
  productId: string;

  @ApiProperty({ example: 1, minimum: 1, description: 'Quantity of the product' })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ type: [SelectedOptionDto], description: 'Selected option items' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectedOptionDto)
  selectedOptions: SelectedOptionDto[];

  @ApiPropertyOptional({ example: 'Ít đường, ít đá', description: 'Note for this item' })
  @IsOptional()
  @IsString()
  note?: string;
}
