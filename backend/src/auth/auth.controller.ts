import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { SignUpDto, LoginDto, SupplierSignUpDto } from '../common/dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async signUp(@Body() body: SignUpDto) {
    return this.authService.signUp(body.email, body.password, {
      full_name: body.full_name,
      joiningDate: body.joiningDate,
      phone: body.phone,
      date_of_birth: body.date_of_birth,
    });
  }

  @Post('supplier-signup')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async supplierSignUp(@Body() body: SupplierSignUpDto) {
    return this.authService.supplierSignUp(body);
  }

  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async signIn(@Body() body: LoginDto) {
    return this.authService.signIn(body.email, body.password);
  }

  @Post('logout')
  async signOut() {
    return this.authService.signOut('');
  }

  @Get('session')
  async getSession() {
    return this.authService.getSession();
  }

  @Post('google')
  async signInWithGoogle() {
    return this.authService.signInWithGoogle();
  }
}
