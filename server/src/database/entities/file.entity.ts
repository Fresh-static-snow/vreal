import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User, Folder } from '@entities';

@Entity('files')
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  relativePath: string;

  @ManyToOne(() => User, (user) => user.files)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ type: 'uuid', nullable: true })
  folderId?: string;

  @ManyToOne(() => Folder, (folder) => folder.files, { nullable: true })
  @JoinColumn({ name: 'folder_id' })
  folder?: Folder;

  @Column({ default: false })
  isPublic: boolean;

  @Column({ type: 'uuid', nullable: true })
  shareToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  shareExpiresAt?: Date;
}
