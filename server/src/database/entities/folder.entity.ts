import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { File, User } from '@entities';

@Entity('folders')
export class Folder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  relativePath: string;

  @ManyToOne(() => Folder, (folder) => folder.children, { nullable: true })
  parent: Folder;

  @OneToMany(() => Folder, (folder) => folder.parent)
  children: Folder[];

  @ManyToOne(() => User, (user) => user.folders)
  owner: User;

  @OneToMany(() => File, (file) => file.folder)
  files: File[];

  @Column({ default: false })
  isPublic: boolean;

  @Column({ type: 'uuid', nullable: true })
  shareToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  shareExpiresAt?: Date;
}
