import { IsEmail, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiPropertyOptional({ example: 'customer@fb.com', description: 'Email address (either email or phone required)' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '0901234567', description: 'Phone number (either email or phone required)' })
  @IsOptional()
  @IsString()
  @Length(10, 15)
  phone?: string;

  @ApiProperty({ example: '123456', description: 'Password (min 6 chars)', minLength: 6 })
  @IsString()
  @Length(6, 100)
  password: string;

  @ApiProperty({ example: 'Nguyễn Văn A', description: 'Full name', minLength: 2 })
  @IsString()
  @Length(2, 100)
  fullName: string;
}
