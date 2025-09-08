import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';
import { EnvironmentVariable } from '@src/common/types';
import { ConfigKeys } from '@src/common/types/config';
import z from 'zod';

const jwtEnvSchema = z.object({
  [EnvironmentVariable.JwtExpires]: z.string().transform(Number),
  [EnvironmentVariable.JwtIssuer]: z.string(),
  [EnvironmentVariable.JwtSecret]: z.string(),
});

export const jwtConfig = registerAs(ConfigKeys.Jwt, (): JwtModuleOptions => {
  const config = jwtEnvSchema.parse(process.env);

  return {
    secret: config[EnvironmentVariable.JwtSecret],
    signOptions: {
      issuer: config[EnvironmentVariable.JwtIssuer],
      expiresIn: config[EnvironmentVariable.JwtExpires],
    },
  };
});
