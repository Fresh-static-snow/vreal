import { registerAs } from '@nestjs/config';
import { JwtSignOptions } from '@nestjs/jwt';
import { EnvironmentVariable } from '@src/common/types';
import { ConfigKeys } from '@src/common/types/config';
import z from 'zod';

const jwtRefreshEnvSchema = z.object({
  [EnvironmentVariable.JwtRefreshExpires]: z.string().transform(Number),
  [EnvironmentVariable.JwtRefreshIssuer]: z.string(),
  [EnvironmentVariable.JwtRefreshSecret]: z.string(),
});

export const jwtRefreshConfig = registerAs(
  ConfigKeys.JwtRefresh,
  (): JwtSignOptions => {
    const config = jwtRefreshEnvSchema.parse(process.env);

    return {
      secret: config[EnvironmentVariable.JwtRefreshSecret],
      issuer: config[EnvironmentVariable.JwtRefreshIssuer],
      expiresIn: config[EnvironmentVariable.JwtRefreshExpires],
    };
  },
);
