import { Body, Controller, Logger, Post, Req, UseGuards } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { CreateUserDto, JwtDto } from '@app/dto';
import { CHECK_AUTH, UserDocument } from '@app/shared';
import { Request } from 'express';

import { LocalAuthGuard } from './guard/local-auth.guard';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Req() req: Request & { user: UserDocument }) {
    const { user } = req;

    return this.authService.login(user);
  }

  @MessagePattern(CHECK_AUTH)
  checkAuth(data: JwtDto) {
    try {
      return this.authService.validateToken(data.jwt);
    } catch (e) {
      this.logger.error(e);

      return false;
    }
  }
}
