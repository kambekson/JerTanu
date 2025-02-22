import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength } from 'class-validator';

export class ForgotPasswordDto {
  @IsString()
  @IsEmail()
  @MaxLength(50, { message: 'Email не должен превышать 50 символов' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;
}