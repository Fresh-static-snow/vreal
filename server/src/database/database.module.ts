import { databaseConfig } from '@common/config/database.config';
import { User, File, Folder } from '@entities';
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvironmentVariable } from '@src/common/types';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { DatabaseService } from './database.service';
import { RepositoryModule } from './repository.module';

@Global()
@Module({
  imports: [
    RepositoryModule,
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const config = databaseConfig();
        return {
          type: 'postgres',
          host: config[EnvironmentVariable.PostgresHost],
          port: config[EnvironmentVariable.PostgresPort],
          username: config[EnvironmentVariable.PostgresUser],
          password: config[EnvironmentVariable.PostgresPassword],
          database: config[EnvironmentVariable.PostgresDatabase],
          schema: config[EnvironmentVariable.PostgresSchema],
          namingStrategy: new SnakeNamingStrategy(),
          synchronize: true,
          migrationsRun: false,
          entities: [User, File, Folder],
        };
      },
    }),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
