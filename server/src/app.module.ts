import { Module } from '@nestjs/common';
import { AuthModule } from '@modules/auth/auth.module';
import { FilesModule } from '@modules/files/files.module';
import { UsersModule } from '@modules/users/users.module';
import { DatabaseModule } from '@src/database/database.module';
import { ConfigModule } from '@nestjs/config';
import { jwtConfig } from '@common/config/jwt.config';
import { jwtRefreshConfig } from '@common/config/jwt-refresh.config';
import { googleOAuthConfig } from '@common/config/google-oauth.config';
import { databaseConfig } from './common/config/database.config';
import * as path from 'path';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UsersModule,
    FilesModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [path.resolve(__dirname, '../../.env')],
      load: [databaseConfig, jwtConfig, jwtRefreshConfig, googleOAuthConfig],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
