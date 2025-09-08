import { googleOAuthConfig } from '@common/config/google-oauth.config';
import { AuthService } from '@modules/auth/auth.service';
import { Inject, Injectable } from '@nestjs/common';
import * as config from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { EnvironmentVariable } from '@src/common/types';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(googleOAuthConfig.KEY)
    private readonly googleOAuthConfiguration: config.ConfigType<typeof googleOAuthConfig>,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: googleOAuthConfiguration[EnvironmentVariable.GoogleOAuthClientId],
      clientSecret: googleOAuthConfiguration[EnvironmentVariable.GoogleOAuthClientSecret],
      callbackURL: googleOAuthConfiguration[EnvironmentVariable.GoogleOAuthCallbackUrl],
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const user = await this.authService.validateGoogleUser({
      email: profile.emails[0].value,
      password: '',
    });

    return user;
  }
}
