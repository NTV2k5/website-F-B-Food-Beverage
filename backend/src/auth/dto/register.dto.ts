import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class RegisterDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(10, 15)
  phone?: string;

  @IsString()
  @Length(6, 100)
  password: string;

  @IsString()
  @Length(2, 100)
  fullName: string;
}
