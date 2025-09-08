import { registerAs } from '@nestjs/config';
import { EnvironmentVariable } from '@src/common/types';
import { ConfigKeys } from '@src/common/types/config';
import z from 'zod';

const googleOAuthSchema = z.object({
  [EnvironmentVariable.GoogleOAuthClientId]: z.string(),
  [EnvironmentVariable.GoogleOAuthClientSecret]: z.string(),
  [EnvironmentVariable.GoogleOAuthCallbackUrl]: z.string(),
});

export const googleOAuthConfig = registerAs(ConfigKeys.GoogleOAuth, () =>
  googleOAuthSchema.parse(process.env),
);
