import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { scrypt as _scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { Buffer } from 'buffer';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../users/user.entity';
import { EmailService } from '../email/email.service';
import { InjectRepository } from '@nestjs/typeorm';
import { VerificationTokenEntity } from '../users/verification-token.entity';
import { Repository } from 'typeorm';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { PasswordResetTokenEntity } from '../users/password-reset-token.entity';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    @InjectRepository(VerificationTokenEntity)
    private tokenRepo: Repository<VerificationTokenEntity>,
    @InjectRepository(PasswordResetTokenEntity)
    private passwordResetTokenRepo: Repository<PasswordResetTokenEntity>,
  ) {}

  async signUp({ email, password }: CreateUserDto) {
    // Проверка на существование пользователя
    const user = await this.userService.findOneByEmail(email);
    if (user) throw new BadRequestException(`User ${user.email} in use`);

    // Хеширование пароля
    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    const result = `${salt}.${hash.toString('hex')}`;

    // Создание нового пользователя
    const newUser = await this.userService.create({ 
      email, 
      password: result,
      isVerified: false 
    });

    // Создание и сохранение токена для подтверждения email
    const verificationToken = await this.createVerificationToken(newUser);
    
    // Отправка письма для подтверждения email
    await this.emailService.sendVerificationEmail(email, verificationToken.token);

    return newUser;
  }

  private async createVerificationToken(user: UserEntity) {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Время жизни токена 24 часа

    // Создание объекта токена
    const verificationToken = this.tokenRepo.create({
      token,
      expiresAt,
      user,
    });

    return this.tokenRepo.save(verificationToken);
  }

  async verifyEmail(token: string) {
    const verificationToken = await this.tokenRepo.findOne({
      where: { token },
      relations: ['user'],
    });

    // Проверка на существование токена и его истечение
    if (!verificationToken) {
      throw new BadRequestException('Invalid verification token');
    }

    if (verificationToken.expiresAt < new Date()) {
      throw new BadRequestException('Token has expired');
    }

    // Подтверждение email
    verificationToken.user.isVerified = true;
    await this.userService.update(verificationToken.user.id, { isVerified: true } as UpdateUserDto);
    await this.tokenRepo.remove(verificationToken);

    return { message: 'Email verified successfully' };
  }

  async validateUser({ email, password }: CreateUserDto) {
    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new BadRequestException('Invalid email');

    const [salt, hashedPassword] = user.password.split('.');
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (hash.toString('hex') !== hashedPassword) return null;
    const { password: userPassword, ...result } = user;

    return result;
  }

  signIn(user: Omit<UserEntity, 'password'>) {
    return {
      access_token: this.jwtService.sign(user),
    };
  }

  signOut(user: Omit<UserEntity, 'password'>) {
    return {
      access_token: null,
    };
  }

  async forgotPassword(email: string) {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new BadRequestException('User with this email does not exist');
    }

    // Create reset token
    const resetToken = await this.createPasswordResetToken(user);
    
    // Send email with reset code
    await this.emailService.sendPasswordResetEmail(email, resetToken.token);

    return { message: 'Password reset instructions have been sent to your email' };
  }

  private async createPasswordResetToken(user: UserEntity) {
    const token = randomBytes(3).toString('hex').toUpperCase(); // 6-character code
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // Token expires in 30 minutes

    const resetToken = this.passwordResetTokenRepo.create({
      token,
      expiresAt,
      user,
    });

    return this.passwordResetTokenRepo.save(resetToken);
  }

  async resetPassword(token: string, newPassword: string) {
    const resetToken = await this.passwordResetTokenRepo.findOne({
      where: { token },
      relations: ['user'],
    });

    if (!resetToken) {
      throw new BadRequestException('Invalid reset token');
    }

    if (resetToken.expiresAt < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    // Hash new password
    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(newPassword, salt, 32)) as Buffer;
    const result = `${salt}.${hash.toString('hex')}`;

    // Update password
    await this.userService.update(resetToken.user.id, { 
      password: result 
    } as UpdateUserDto);

    // Remove used token
    await this.passwordResetTokenRepo.remove(resetToken);

    return { message: 'Password has been reset successfully' };
  }
}
