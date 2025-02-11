import { IsBoolean, IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { PasswordMatch } from '../decorators/password-match.decorator';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'Имя должно быть строкой' })
  @MinLength(2, { message: 'Имя должно содержать минимум 2 символа' })
  @MaxLength(32, { message: 'Имя не должно превышать 32 символа' })
  @Transform(({ value }) => value?.trim())
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Фамилия должна быть строкой' })
  @MinLength(2, { message: 'Фамилия должна содержать минимум 2 символа' })
  @MaxLength(32, { message: 'Фамилия не должна превышать 32 символа' })
  @Transform(({ value }) => value?.trim())
  lastName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Неверный формат email' })
  @MaxLength(50, { message: 'Email не должен превышать 50 символов' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  email?: string;

  @IsOptional()
  @IsString({ message: 'Пароль должен быть строкой' })
  @MinLength(8, { message: 'Пароль должен содержать минимум 8 символов' })
  @MaxLength(32, { message: 'Пароль не должен превышать 32 символа' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/, {
    message: 'Пароль должен содержать как минимум одну заглавную букву, одну строчную букву, одну цифру и один специальный символ',
  })
  password?: string;

  @IsOptional()
  @IsString({ message: 'Подтверждение пароля должно быть строкой' })
  @MinLength(8, { message: 'Подтверждение пароля должно содержать минимум 8 символов' })
  @MaxLength(32, { message: 'Подтверждение пароля не должно превышать 32 символа' })
  @PasswordMatch('password', { message: 'Пароли не совпадают' })
  confirmPassword?: string;

  @IsOptional()
  @IsBoolean({ message: 'Поле верификации должно быть логическим значением' })
  isVerified?: boolean;
}
