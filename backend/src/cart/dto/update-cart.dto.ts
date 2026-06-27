import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateCartDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  note?: string;
}
