import { Folder } from '@entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './shared/base.repository';

@Injectable()
export class FolderRepository extends BaseRepository<Folder> {
  public constructor(@InjectRepository(Folder) repository: Repository<Folder>) {
    super(repository);
  }
}
