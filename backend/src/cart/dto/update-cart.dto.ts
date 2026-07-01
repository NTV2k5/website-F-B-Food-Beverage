import { IsInt, IsOptional, Min, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCartDto {
  @ApiPropertyOptional({ example: 2, minimum: 1, description: 'Updated quantity of the product' })
  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional({ example: 'Nhiều đá', description: 'Updated note for the item' })
  @IsString()
  @IsOptional()
  note?: string;
}
