import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from './shared/base.repository';
import { User } from '@entities';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  public constructor(@InjectRepository(User) repository: Repository<User>) {
    super(repository);
  }
}
