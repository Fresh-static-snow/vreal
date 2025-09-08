import { DeleteDateColumn, UpdateDateColumn, CreateDateColumn } from 'typeorm';

export abstract class BaseTimeMetric {
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  public deletedAt?: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  public updatedAt?: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', nullable: true })
  public createdAt?: Date;
}
