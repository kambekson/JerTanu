import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from "../users/users.module";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { LocalStrategy } from "./strategies/local.strategy";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { RefreshJwtStrategy } from "./strategies/refresh-token.strategy";
import { VerificationTokenEntity } from 'src/email/verification-token.entity';
import { PasswordResetTokenEntity } from 'src/email/password-reset-token.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from 'src/email/email.service';
@Module({
  providers: [AuthService, LocalStrategy, JwtStrategy, RefreshJwtStrategy, EmailService],
  controllers: [AuthController],
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
    }),
    PassportModule,
    TypeOrmModule.forFeature([VerificationTokenEntity, PasswordResetTokenEntity])
  ]
})
export class AuthModule {}
