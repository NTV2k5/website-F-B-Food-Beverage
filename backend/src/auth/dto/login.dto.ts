import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class LoginDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(10, 15)
  phone?: string;

  @IsString()
  password: string;
}
