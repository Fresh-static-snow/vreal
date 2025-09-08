import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { File, Folder } from '@entities';
import { Role } from '@src/common/types/role';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  public id: number;

  @Column({ unique: true })
  public email: string;

  @Column({ type: 'varchar', nullable: true })
  public password: string | null;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  public role: Role;

  @OneToMany(() => File, (file) => file.owner)
  public files: File[];

  @OneToMany(() => Folder, (folder) => folder.owner)
  public folders: Folder[];

  @Column({ type: 'varchar', nullable: true })
  public hashedRefreshToken: string | null;

  @Column({ type: 'varchar', nullable: true })
  public googleAuthCode?: string;

  @Column({ type: 'varchar', nullable: true })
  public googleAccessToken?: string;

  @Column({ type: 'varchar', nullable: true })
  public googleRefreshToken?: string;

  @Column({ type: 'varchar', nullable: true })
  public googleEmail?: string;
}
