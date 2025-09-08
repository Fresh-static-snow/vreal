import { Injectable } from '@nestjs/common';
import { File, Folder } from '@src/database/entities';
import { randomBytes } from 'crypto';
import { copyFileSync, promises as fs } from 'fs';
import { join } from 'path';
import { ILike, Not } from 'typeorm';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class FilesService {
  private sharedFiles: Record<string, string> = {};
  constructor(private readonly databaseService: DatabaseService) {}

  async search(query: string, userId: number) {
    const files = await this.databaseService.file.find({
      where: {
        owner: { id: userId },
        name: ILike(`%${query}%`),
      },
    });

    const folders = await this.databaseService.folder.find({
      where: {
        owner: { id: userId },
        name: ILike(`%${query}%`),
      },
    });

    return { files, folders };
  }

  async findAllFilesByUser(userId: number): Promise<File[]> {
    return this.databaseService.file.find({
      where: { owner: { id: userId } },
      relations: ['folder', 'owner'],
    });
  }

  async findAllFilesSharedWithUser(userId: number): Promise<File[]> {
    return this.databaseService.file.find({
      where: { isPublic: true, owner: { id: Not(userId) } },
      relations: ['folder', 'owner'],
    });
  }

  async findAllFoldersByUser(userId: number): Promise<Folder[]> {
    return this.databaseService.folder.find({
      where: { owner: { id: userId } },
      relations: ['parent', 'children', 'files'],
    });
  }

  async findFileById(fileId: string): Promise<File | null> {
    return this.databaseService.file.findOne({
      where: { id: fileId },
      relations: ['owner', 'folder'],
    });
  }

  async toggleFilePublic(fileId: string, userId: number): Promise<File> {
    const file = await this.findFileById(fileId);
    if (!file || file.owner.id !== userId) throw new Error('Not authorized');
    file.isPublic = !file.isPublic;
    return this.databaseService.file.save(file);
  }

  async removeFile(
    fileId: string,
    userId: number,
  ): Promise<{ success: boolean }> {
    const file = await this.databaseService.file.findOne({
      where: { id: fileId },
      relations: ['owner'],
    });
    if (!file || file.owner.id !== userId) throw new Error('Not authorized');

    await fs.unlink(
      join(process.cwd(), 'uploads', `${userId}`, file.relativePath),
    );
    await this.databaseService.file.remove(file);

    return { success: true };
  }

  async renameFile(
    fileId: string,
    newName: string,
    userId: number,
  ): Promise<File> {
    const file = await this.databaseService.file.findOne({
      where: { id: fileId },
      relations: ['owner'],
    });
    if (!file || file.owner.id !== userId) throw new Error('Not authorized');

    const oldPath = join(
      process.cwd(),
      'uploads',
      `${userId}`,
      file.relativePath,
    );
    const newPathRelative = file.relativePath.replace(file.name, newName);
    const newPath = join(
      process.cwd(),
      'uploads',
      `${userId}`,
      newPathRelative,
    );

    await fs.rename(oldPath, newPath);

    file.name = newName;
    file.relativePath = newPathRelative;

    return this.databaseService.file.save(file);
  }

  async renameFolder(
    folderId: string,
    newName: string,
    userId: number,
  ): Promise<Folder> {
    const folder = await this.databaseService.folder.findOne({
      where: { id: folderId },
      relations: ['owner', 'files'],
    });
    if (!folder || folder.owner.id !== userId)
      throw new Error('Not authorized');

    const oldRelativePath = folder.relativePath;
    const oldFolderPath = join(
      process.cwd(),
      'uploads',
      `${userId}`,
      oldRelativePath,
    );
    const parentPath = oldRelativePath.substring(
      0,
      oldRelativePath.lastIndexOf('/'),
    );
    const newRelativePath = parentPath ? `${parentPath}/${newName}` : newName;
    const newFolderFullPath = join(
      process.cwd(),
      'uploads',
      `${userId}`,
      newRelativePath,
    );

    await fs.rename(oldFolderPath, newFolderFullPath);

    folder.name = newName;
    folder.relativePath = newRelativePath;
    await this.databaseService.folder.save(folder);

    const files = await this.databaseService.file.find({
      where: { folder: { id: folderId } },
    });

    for (const file of files) {
      const oldFileFullPath = join(
        process.cwd(),
        'uploads',
        `${userId}`,
        file.relativePath,
      );
      const newFileRelativePath = file.relativePath.replace(
        oldRelativePath,
        newRelativePath,
      );
      const newFileFullPath = join(
        process.cwd(),
        'uploads',
        `${userId}`,
        newFileRelativePath,
      );

      await fs.rename(oldFileFullPath, newFileFullPath);

      file.relativePath = newFileRelativePath;
      await this.databaseService.file.save(file);
    }

    return folder;
  }

  async cloneFile(fileId: string, userId: number): Promise<File> {
    const file = await this.databaseService.file.findOne({
      where: { id: fileId },
      relations: ['owner'],
    });
    if (!file || file.owner.id !== userId) throw new Error('Not authorized');

    const oldFullPath = join(
      process.cwd(),
      'uploads',
      `${userId}`,
      file.relativePath,
    );
    const extMatch = file.name.match(/(\.[^/.]+)$/);
    const ext = extMatch ? extMatch[1] : '';
    const baseName = ext ? file.name.slice(0, -ext.length) : file.name;

    let copyIndex = 1;
    let newName = `${baseName} (copy)${ext}`;
    let newPathRelative = file.relativePath.replace(file.name, newName);

    while (
      await this.databaseService.file.findOne({
        where: { relativePath: newPathRelative, owner: { id: userId } },
      })
    ) {
      newName = `${baseName} (copy ${copyIndex})${ext}`;
      newPathRelative = file.relativePath.replace(file.name, newName);
      copyIndex++;
    }

    const newFullPath = join(
      process.cwd(),
      'uploads',
      `${userId}`,
      newPathRelative,
    );
    copyFileSync(oldFullPath, newFullPath);

    const clonedFile = this.databaseService.file.create({
      name: newName,
      relativePath: newPathRelative,
      owner: { id: userId },
    });

    return this.databaseService.file.save(clonedFile);
  }

  async findFolderById(folderId: string, userId: number): Promise<Folder> {
    const folder = await this.databaseService.folder.findOne({
      where: { id: folderId, owner: { id: userId } },
      relations: ['parent', 'children', 'files'],
    });
    if (!folder) {
      throw new Error('Folder not found or not authorized');
    }
    return folder;
  }

  async findFilesInFolder(userId: string, folderId: string): Promise<File[]> {
    return this.databaseService.file.find({
      where: { owner: { id: Number(userId) }, folder: { id: folderId } },
      relations: ['folder', 'owner'],
    });
  }

  async createFolder(
    createFolderDto: { name: string; parentId?: string },
    ownerId: number,
  ): Promise<Folder> {
    if (!createFolderDto.name) throw new Error('Folder name is required');

    let parent: Folder | undefined;
    let parentPath = '';

    if (createFolderDto.parentId) {
      parent =
        (await this.databaseService.folder.findOne({
          where: { id: createFolderDto.parentId },
        })) ?? undefined;

      if (!parent) throw new Error('Parent folder not found');
      parentPath = parent.relativePath;
    }

    const folderPath = parentPath
      ? `${parentPath}/${createFolderDto.name}`
      : createFolderDto.name;

    const fullFolderPath = join(
      process.cwd(),
      'uploads',
      `${ownerId}`,
      folderPath,
    );

    await fs.mkdir(fullFolderPath, { recursive: true });

    const folder = this.databaseService.folder.create({
      name: createFolderDto.name,
      owner: { id: ownerId },
      relativePath: folderPath,
      parent,
    });

    return this.databaseService.folder.save(folder);
  }

  async createFile(
    createFileDto: { name: string; folderId?: string; buffer?: Buffer },
    ownerId: number,
  ): Promise<File> {
    if (!createFileDto.name) throw new Error('File name is required');

    let folder: Folder | undefined;
    let folderPath = '';

    if (createFileDto.folderId) {
      folder = await this.loadFolderWithParents(createFileDto.folderId);
      if (!folder) throw new Error('Folder not found');
      folderPath = this.buildFolderPath(folder);
    }

    const relativePath = folderPath
      ? `${folderPath}/${createFileDto.name}`
      : createFileDto.name;

    const fullPath = join(process.cwd(), 'uploads', `${ownerId}`, relativePath);
    await fs.mkdir(join(fullPath, '..'), { recursive: true });
    await fs.writeFile(fullPath, createFileDto.buffer ?? Buffer.alloc(0));

    const file = this.databaseService.file.create({
      name: createFileDto.name,
      owner: { id: ownerId },
      folder,
      relativePath,
    });

    return this.databaseService.file.save(file);
  }

  private buildFolderPath(folder: Folder | undefined): string {
    if (!folder) return '';
    return folder.parent
      ? `${this.buildFolderPath(folder.parent)}/${folder.name}`
      : folder.name;
  }

  private async loadFolderWithParents(
    folderId: string,
  ): Promise<Folder | undefined> {
    let folder = await this.databaseService.folder.findOne({
      where: { id: folderId },
      relations: ['parent'],
    });
    if (!folder) return undefined;

    let current = folder;
    while (current.parent) {
      const parentFolder = await this.databaseService.folder.findOne({
        where: { id: current.parent.id },
        relations: ['parent'],
      });

      if (!parentFolder) break;
      current.parent = parentFolder;
      current = current.parent;
    }

    return folder;
  }

  async deleteFolder(folderId: string, ownerId: number) {
    const folder = await this.databaseService.folder.findOne({
      where: { id: folderId, owner: { id: ownerId } },
      relations: ['files', 'children'],
    });
    if (!folder) throw new Error('Folder not found');

    for (const file of folder.files) {
      await fs.unlink(
        join(process.cwd(), 'uploads', `${ownerId}`, file.relativePath),
      );
      await this.databaseService.file.remove(file);
    }

    for (const child of folder.children) {
      await this.deleteFolder(child.id, ownerId);
    }

    await this.databaseService.folder.remove(folder);
  }

  async getSharedFolderByToken(shareToken: string): Promise<Folder> {
    const folder = await this.databaseService.folder.findOne({
      where: { shareToken },
      relations: ['files', 'children'],
    });
    if (!folder) {
      throw new Error('No folder found for the given share token');
    }
    return folder;
  }

  async generateFileShareToken(fileId: string): Promise<string> {
    const token = randomBytes(16).toString('hex');
    this.sharedFiles[token] = fileId;
    return token;
  }

  getFileIdByToken(token: string): string | null {
    return this.sharedFiles[token] || null;
  }
}
