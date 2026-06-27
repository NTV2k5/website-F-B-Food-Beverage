import { IsString, IsInt, IsOptional, Min, ValidateNested, ArrayNotEmpty, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

class SelectedOptionDto {
  @IsString()
  groupId: string;

  @IsString()
  optionId: string;
}

export class AddToCartDto {
  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectedOptionDto)
  selectedOptions: SelectedOptionDto[];

  @IsOptional()
  @IsString()
  note?: string;
}
