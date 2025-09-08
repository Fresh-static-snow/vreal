import { registerAs } from '@nestjs/config';
import { EnvironmentVariable } from '@src/common/types';
import { ConfigKeys } from '@src/common/types/config';
import z from 'zod';

const databaseEnvSchema = z.object({
  [EnvironmentVariable.PostgresHost]: z.string(),
  [EnvironmentVariable.PostgresPort]: z.string().transform(Number),
  [EnvironmentVariable.PostgresUser]: z.string(),
  [EnvironmentVariable.PostgresPassword]: z.string(),
  [EnvironmentVariable.PostgresDatabase]: z.string(),
  [EnvironmentVariable.PostgresSchema]: z.string().default('public'),
});

export const databaseConfig = registerAs(ConfigKeys.Database, () =>
  databaseEnvSchema.parse(process.env),
);
