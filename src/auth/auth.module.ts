import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationTokenEntity } from '../users/entities/verification-token.entity';
import { EmailService } from '../email/email.service';
import { ConfigModule } from '@nestjs/config';
import { PasswordResetTokenEntity } from '../users/entities/password-reset-token.entity';

@Module({
  imports: [
    UsersModule,
    ConfigModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
    }),
    PassportModule,
    TypeOrmModule.forFeature([VerificationTokenEntity, PasswordResetTokenEntity]),
  ],
  providers: [AuthService, LocalStrategy, EmailService],
  controllers: [AuthController],
})
export class AuthModule {}
