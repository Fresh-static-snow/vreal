import { Public } from '@common/decorators/public.decorator';
import { ControllerKeys } from '@common/types';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { Folder } from '@src/database/entities';
import { join } from 'path';
import { FilesService } from './files.service';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller(ControllerKeys.Files)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('search')
  async searchFilesAndFolders(@Query('q') query: string, @Req() req) {
    return this.filesService.search(query, req.user.id);
  }

  @Get()
  async getUserFiles(@Req() req) {
    return this.filesService.findAllFilesByUser(req.user.id);
  }

  @Get('shared')
  async getSharedWithUserFiles(@Req() req) {
    return this.filesService.findAllFilesSharedWithUser(req.user.id);
  }

  @Get('folders')
  async getUserFolders(@Req() req) {
    return this.filesService.findAllFoldersByUser(req.user.id);
  }

  @Post('folders')
  async createFolder(
    @Body() body: { name: string; parentId?: string },
    @Req() req,
  ) {
    return this.filesService.createFolder(
      { name: body.name, parentId: body.parentId },
      req.user.id,
    );
  }

  @UseInterceptors(FilesInterceptor('files'))
  @Post()
  async uploadFiles(@Req() req, @Body() body: { folderId?: string }) {
    const createdFiles = [];
    const files = (req.files as Express.Multer.File[]) || [];

    for (const file of files) {
      let folder: Folder | undefined;
      let folderPath = '';

      if (body.folderId) {
        const foundFolder = await this.filesService[
          'databaseService'
        ].folder.findOne({
          where: { id: body.folderId },
        });
        if (foundFolder) {
          folder = foundFolder;
          folderPath = folder.relativePath;
        }
      }
      const created = await this.filesService.createFile(
        {
          name: file.originalname,
          folderId: folder?.id,
          buffer: file.buffer,
        },
        req.user.id,
      );
      createdFiles.push(created as never);
    }

    return createdFiles;
  }

  @Public()
  @Get(':id/download')
  async downloadFile(@Param('id') id: string, @Res() res: any) {
    const file = await this.filesService.findFileById(id);
    if (!file) {
      return res.status(404).send({ message: 'File not found' });
    }

    res.sendFile(
      join(process.cwd(), 'uploads', `${file.owner.id}`, file.relativePath),
    );
  }

  @Post(':id/toggle-public')
  async togglePublic(@Param('id') id: string, @Req() req) {
    return this.filesService.toggleFilePublic(id, req.user.id);
  }

  @Delete(':id')
  async removeFile(@Param('id') id: string, @Req() req) {
    return this.filesService.removeFile(id, req.user.id);
  }

  @Patch(':id/rename')
  async renameFile(
    @Param('id') id: string,
    @Body() body: { name: string },
    @Req() req,
  ) {
    return this.filesService.renameFile(id, body.name, req.user.id);
  }

  @Post(':id/clone')
  async cloneFile(@Param('id') id: string, @Req() req) {
    return this.filesService.cloneFile(id, req.user.id);
  }

  @Get('folders/:id')
  async getFolderById(@Param('id') id: string, @Req() req) {
    return this.filesService.findFolderById(id, req.user.id);
  }

  @Delete('folders/:id')
  async deleteFolder(@Param('id') id: string, @Req() req) {
    return this.filesService.deleteFolder(id, req.user.id);
  }

  @Get('folders/:id/files')
  async getFilesInFolder(@Param('id') folderId: string, @Req() req) {
    return this.filesService.findFilesInFolder(req.user.id, folderId);
  }

  @Post(':id/share')
  async shareFile(@Param('id') id: string) {
    const token = await this.filesService.generateFileShareToken(id);

    return { link: `${process.env.CLIENT_URL}/shared/${token}` };
  }

  @Public()
  @Get('shared/:token')
  async getSharedFileByToken(@Param('token') token: string) {
    const fileId = this.filesService.getFileIdByToken(token);

    if (!fileId) {
      return { message: 'Invalid or expired token', valid: false };
    }

    const file = await this.filesService.findFileById(fileId);
    if (!file) {
      return { message: 'File not found', valid: false };
    }

    return { valid: true, file };
  }

  @Public()
  @Get('shared/:token/validate')
  async validateFileShareToken(@Param('token') token: string) {
    const fileId = this.filesService.getFileIdByToken(token);

    if (fileId) {
      return { valid: true };
    } else {
      return { valid: false };
    }
  }
}
