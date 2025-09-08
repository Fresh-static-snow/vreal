import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from '@common/guards/local-auth/local-auth.guard';
import { RefreshAuthGuard } from '@common/guards/refresh-auth/refresh-auth.guard';
import { Public } from '@common/decorators/public.decorator';
import { GoogleAuthGuard } from '@common/guards/google-auth/google-auth.guard';
import type { Request, Response } from 'express';
import { refreshCookie, refreshCookieOptions } from './auth.constants';
import { ControllerKeys } from '@src/common/types';

@Controller(ControllerKeys.Auth)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.login(
      req.user.id,
    );

    res.cookie(refreshCookie, refreshToken, refreshCookieOptions);
    return { accessToken };
  }

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { email, password } = req.body;
    const { accessToken, refreshToken } = await this.authService.register(
      email,
      password,
    );

    res.cookie(refreshCookie, refreshToken, refreshCookieOptions);
    return { accessToken };
  }

  @Public()
  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  async refresh(@Req() req) {
    return this.authService.generateAccessToken(req.user.id);
  }

  @Public()
  @UseGuards(RefreshAuthGuard)
  @Post('signout')
  signOut(@Req() req, @Res({ passthrough: true }) res: Response) {
    res.clearCookie(refreshCookie, refreshCookieOptions);
    return this.authService.signOut(req.user.id);
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  googleLogin() {}

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(@Req() req, @Res() res: Response) {
    const response = await this.authService.login(req.user.id);

    res.cookie(refreshCookie, response.refreshToken, refreshCookieOptions);
    res.redirect(
      `${process.env.CLIENT_URL}/?accessToken=${response.accessToken}`,
    );
  }
}
