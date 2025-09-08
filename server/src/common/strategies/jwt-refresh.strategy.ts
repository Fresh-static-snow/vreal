import * as config from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { JwtPayload } from '../types/jwt-payload';
import { Inject, Injectable } from '@nestjs/common';
import { jwtRefreshConfig } from '@common/config/jwt-refresh.config';
import { Request } from 'express';
import { AuthService } from '@modules/auth/auth.service';
import { StrategyKeys } from '@src/common/types';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  StrategyKeys.Refresh,
) {
  constructor(
    @Inject(jwtRefreshConfig.KEY)
    private refreshJwtConfiguration: config.ConfigType<typeof jwtRefreshConfig>,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: (req: Request) => {
        return req?.cookies?.refreshToken;
      },
      secretOrKey: refreshJwtConfiguration.secret!,
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload, token: string) {
    return this.authService.validateRefreshToken(token);
  }
}
