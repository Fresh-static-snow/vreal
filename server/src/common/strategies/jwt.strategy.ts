import * as config from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConfig } from '@common/config/jwt.config';
import { JwtPayload } from '../types/jwt-payload';
import { Inject, Injectable } from '@nestjs/common';
import { AuthService } from '@modules/auth/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(jwtConfig.KEY)
    private jwtConfiguration: config.ConfigType<typeof jwtConfig>,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConfiguration.secret!,
      ignoreExpiration: false,
    });
  }

  validate(payload: JwtPayload) {
    return this.authService.validateJwtUser(payload.sub);
  }
}
