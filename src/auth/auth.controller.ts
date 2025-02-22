import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { GetUser } from "./get-user.decorator";
import { UserEntity } from "../users/user.entity";
import { Public } from "../interceptors/public.interceptor";
import { RefreshJwtAuthGuard } from "./guards/refresh-jwt-auth.guard";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('sign-in')
  signIn(@GetUser() user: UserEntity) {
    return this.authService.signIn(user);
  }

  @Public()
  @Post('sign-up')
  async signUp(@Body() body: CreateUserDto) {
    const user = await this.authService.signUp(body);
    return { message: 'Проверьте свою почту для подтверждения регистрации', user };
  }

  @Public()
  @UseGuards(RefreshJwtAuthGuard)
  @Post('refresh')
  async refresh(@GetUser() user: UserEntity) {
    return this.authService.refreshToken(user)
  }

  @Get('verify-email/:token')
  verifyEmail(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Public()
  @Post('forgot-password')
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body.email);
  }

  @Public()
  @Post('reset-password')
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }
}
