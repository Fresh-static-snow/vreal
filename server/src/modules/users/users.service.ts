import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DatabaseService } from '@src/database/database.service';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createUserDto: CreateUserDto) {
    const user = this.databaseService.user.create(createUserDto);
    return this.databaseService.user.save(user);
  }

  async findByEmail(email: string) {
    return this.databaseService.user.findOne({
      where: {
        email,
      },
    });
  }

  async findOne(id: number) {
    return this.databaseService.user.findOne({
      where: { id },
      select: ['id', 'hashedRefreshToken', 'role'],
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
