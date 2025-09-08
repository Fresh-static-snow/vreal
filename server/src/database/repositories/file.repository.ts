import { File } from '@entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './shared/base.repository';

@Injectable()
export class FileRepository extends BaseRepository<File> {
  public constructor(@InjectRepository(File) repository: Repository<File>) {
    super(repository);
  }
}
