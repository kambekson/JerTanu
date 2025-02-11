import { IsBoolean, IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength} from 'class-validator';
import { PasswordMatch } from '../decorators/password-match.decorator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Имя обязательно для заполнения' })
  @IsString({ message: 'Имя должно быть строкой' })
  @MinLength(2, { message: 'Имя должно содержать минимум 2 символа' })
  @MaxLength(32, { message: 'Имя не должно превышать 32 символа' })
  @Transform(({ value }) => value?.trim()) // Убирает пробелы в начале и конце
  firstName: string;

  @IsNotEmpty({ message: 'Фамилия обязательна для заполнения' })
  @IsString({ message: 'Фамилия должна быть строкой' })
  @MinLength(2, { message: 'Фамилия должна содержать минимум 2 символа' })
  @MaxLength(32, { message: 'Фамилия не должна превышать 32 символа' })
  @Transform(({ value }) => value?.trim()) // Убирает пробелы в начале и конце
  lastName: string;

  @IsNotEmpty({ message: 'Email обязателен для заполнения' })
  @IsEmail({}, { message: 'Неверный формат email' })
  @MaxLength(50, { message: 'Email не должен превышать 50 символов' })
  @Transform(({ value }) => value?.trim().toLowerCase()) // Убирает пробелы в начале и конце и приводит к нижнему регистру
  email: string;

  @IsNotEmpty({ message: 'Пароль обязателен для заполнения' })
  @IsString({ message: 'Пароль должен быть строкой' })
  @MinLength(8, { message: 'Пароль должен содержать минимум 8 символов' })
  @MaxLength(32, { message: 'Пароль не должен превышать 32 символа' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/, {
    message: 'Пароль должен содержать как минимум одну заглавную букву, одну строчную букву, одну цифру и один специальный символ',
  })
  password: string;

  @IsNotEmpty({ message: 'Подтверждение пароля обязательно' })
  @IsString({ message: 'Подтверждение пароля должно быть строкой' })
  @MinLength(8, { message: 'Подтверждение пароля должно содержать минимум 8 символов' })
  @MaxLength(32, { message: 'Подтверждение пароля не должно превышать 32 символа' })
  @PasswordMatch('password', { message: 'Пароли не совпадают' })
  confirmPassword: string;

  @IsBoolean({ message: 'Поле верификации должно быть логическим значением' })
  isVerified?: boolean;
}
