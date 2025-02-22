import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { UsersService } from "../users/users.service";
import { scrypt as _scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { Buffer } from 'buffer';
import { JwtService } from "@nestjs/jwt";
import { UserEntity } from "../users/user.entity";
import { SignInDto } from "./dto/sign-in.dto";
import { EmailService } from "../email/email.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { VerificationTokenEntity } from "src/email/verification-token.entity";
import { PasswordResetTokenEntity } from "src/email/password-reset-token.entity";
import { UpdateUserDto } from "src/users/dto/update-user.dto";

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
    private passwordResetTokenRepo: Repository<PasswordResetTokenEntity>
  ) {}

  async signUp({ email, password, profile }: CreateUserDto) {
    const user = await this.userService.findOneByEmail(email);
    if (user) throw new BadRequestException(`User ${user.email} in use`);

    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    const result = `${salt}.${hash.toString('hex')}`;
    const newUser = await this.userService.create({ email, password: result, profile })

    const verificationToken = await this.createVerificationToken(newUser)
    await this.emailService.sendVerificationEmail(email, verificationToken.token)
    return newUser

  }

  async validateUser({ email, password }: SignInDto) {
    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new BadRequestException('Invalid email');

    const [salt, hashedPassword] = user.password.split('.');
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (hash.toString('hex') !== hashedPassword) return null;
    const { password: userPassword, ...result } = user;

    return result;
  }

  async verifyEmail(token: string) {
    const verificationToken = await this.tokenRepo.findOne({
      where: { token },
      relations: ['user'],
    });

    if (!verificationToken) {
      throw new BadRequestException('Invalid verification token');
    }

    if (verificationToken.expiresAt < new Date()) {
      throw new BadRequestException('Token has expired');
    }

    verificationToken.user.isVerified = true;
    await this.userService.update(verificationToken.user.id, { isVerified: true } as UpdateUserDto);
    await this.tokenRepo.remove(verificationToken);

    return { message: 'Email verified successfully' };
  }

  private async createVerificationToken(user: UserEntity) {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 2);
    const verificationToken = this.tokenRepo.create({
      token,
      expiresAt,
      user,
    });

    return this.tokenRepo.save(verificationToken);
  }

  signIn(user: Omit<UserEntity, "password">) {
    return {
      access_token: this.jwtService.sign(user, { expiresIn: '60s'}),
      refresh_token: this.jwtService.sign(user, { expiresIn: '4d'})
    };
  }

  refreshToken(user: Omit<UserEntity, "password">) {
    return {
      access_token: this.jwtService.sign(user)
    };
  }

  async forgotPassword(email: string) {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new BadRequestException('User with this email does not exist');
    }
    const resetToken = await this.createPasswordResetToken(user);
    await this.emailService.sendPasswordResetEmail(email, resetToken.token);
    return { message: 'Password reset instructions have been sent to your email' };
  }

  private async createPasswordResetToken(user: UserEntity) {
    const token = randomBytes(3).toString('hex').toUpperCase();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

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

    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(newPassword, salt, 32)) as Buffer;
    const result = `${salt}.${hash.toString('hex')}`;

    await this.userService.update(resetToken.user.id, {
      password: result
    } as UpdateUserDto);

    await this.passwordResetTokenRepo.remove(resetToken);

    return { message: 'Password has been reset successfully' };
  }
}
