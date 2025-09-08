import { PrimaryGeneratedColumn } from 'typeorm';

export abstract class BaseId {
  @PrimaryGeneratedColumn('increment')
  id: number;
}

export abstract class BaseUuid {
  @PrimaryGeneratedColumn('uuid')
  id: string;
}
