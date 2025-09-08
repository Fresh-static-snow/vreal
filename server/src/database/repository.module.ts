import { File, Folder, User } from '@entities';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import {
  FileRepository,
  FolderRepository,
  UserRepository,
} from '@repositories';

@Module({
  imports: [TypeOrmModule.forFeature([File, Folder, User]), ConfigModule],
  providers: [FileRepository, FolderRepository, UserRepository],
  exports: [FileRepository, FolderRepository, UserRepository],
})
export class RepositoryModule {}
