import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';

@Injectable()
export class BaseRepository<
  T extends { id?: number | string; key?: string; deletedAt?: Date },
> extends Repository<T> {
  public constructor(protected repository: Repository<T>) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  public async findByIdOrFail(
    id: number,
    options?: Omit<FindOneOptions<T>, 'where'>,
  ): Promise<T> {
    if (id === undefined || id === null)
      throw new BadRequestException(
        `The unique identifier of the ${this.repository.metadata.name} is undefined`,
      );

    const entity = await this.repository.findOne({
      where: { id } as FindOptionsWhere<T>,
      ...options,
    });

    if (!entity)
      throw new NotFoundException(
        `${this.repository.metadata.name} with id ${id} not found`,
      );

    return entity;
  }
}
