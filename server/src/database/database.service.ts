import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { UserRepository } from './repositories/user.repository';
import { FolderRepository } from './repositories/folder.repository';
import { FileRepository } from './repositories/file.repository';

@Injectable()
export class DatabaseService {
  public constructor(
    public readonly user: UserRepository,
    public readonly file: FileRepository,
    public readonly folder: FolderRepository,

    @InjectEntityManager() public manager: EntityManager,
  ) {}
}
