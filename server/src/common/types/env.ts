enum EnvironmentVariable {
  PostgresUser = 'POSTGRES_USER',
  PostgresPassword = 'POSTGRES_PASSWORD',
  PostgresPort = 'POSTGRES_PORT',
  PostgresHost = 'POSTGRES_HOST',
  PostgresDatabase = 'POSTGRES_DB',
  PostgresSchema = 'POSTGRES_SCHEMA',

  GoogleOAuthClientId = 'GOOGLE_OAUTH_CLIENT_ID',
  GoogleOAuthClientSecret = 'GOOGLE_OAUTH_CLIENT_SECRET',
  GoogleOAuthCallbackUrl = 'GOOGLE_OAUTH_CALLBACK_URL',

  JwtSecret = 'JWT_SECRET',
  JwtIssuer = 'JWT_ISSUER',
  JwtExpires = 'JWT_EXPIRES',

  JwtRefreshSecret = 'JWT_REFRESH_SECRET',
  JwtRefreshIssuer = 'JWT_REFRESH_ISSUER',
  JwtRefreshExpires = 'JWT_REFRESH_EXPIRES',
}

export { EnvironmentVariable };
