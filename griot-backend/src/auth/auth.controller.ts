import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GoogleLoginDto } from './dto/google-login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  loginWithGoogle(@Body() dto: GoogleLoginDto) {
    return this.authService.loginWithGoogle(dto.credential);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req) {
    return this.authService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateProfile(@Req() req, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  changePassword(@Req() req, @Body() body: { currentPassword: string; newPassword: string }) {
    return this.authService.changePassword(req.user.id, body.currentPassword, body.newPassword);
  }
}
