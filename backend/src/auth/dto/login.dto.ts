import { IsEmail, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiPropertyOptional({ example: 'customer@fb.com', description: 'Email address (either email or phone required)' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '0901234567', description: 'Phone number (either email or phone required)' })
  @IsOptional()
  @IsString()
  @Length(10, 15)
  phone?: string;

  @ApiProperty({ example: '123456', description: 'Password (min 6 chars)' })
  @IsString()
  password: string;
}
