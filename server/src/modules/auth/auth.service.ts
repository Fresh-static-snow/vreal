import { jwtRefreshConfig } from '@common/config/jwt-refresh.config';
import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as config from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CurrentUser, JwtPayload } from '@src/common/types';
import { DatabaseService } from '@src/database/database.service';
import * as argon2 from 'argon2';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(jwtRefreshConfig.KEY)
    private readonly refreshJwtConfiguration: config.ConfigType<
      typeof jwtRefreshConfig
    >,
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.databaseService.user.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('User not found!');
    if (!user.password) throw new UnauthorizedException('Invalid credentials');

    const isPasswordMatch = await argon2.verify(user.password, password);
    if (!isPasswordMatch)
      throw new UnauthorizedException('Invalid credentials');

    return { id: user.id };
  }

  async generateAccessToken(userId: number) {
    const payload: JwtPayload = { sub: userId };
    const accessToken = await this.jwtService.signAsync(payload);
    return accessToken;
  }

  async generateRefreshToken(userId: number) {
    const payload: JwtPayload = { sub: userId };
    const refreshToken = await this.jwtService.signAsync(
      payload,
      this.refreshJwtConfiguration,
    );
    return refreshToken;
  }

  async login(userId: number) {
    const accessToken = await this.generateAccessToken(userId);
    const refreshToken = await this.generateRefreshToken(userId);

    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.databaseService.user.update(userId, { hashedRefreshToken });

    return { id: userId, accessToken, refreshToken };
  }

  async register(email: string, password: string) {
    const existingUser = await this.databaseService.user.findOne({
      where: { email },
    });
    if (existingUser) throw new ConflictException('User already exists');

    const hashedPassword = await argon2.hash(password);
    const user = this.databaseService.user.create({
      email,
      password: hashedPassword,
    });
    const savedUser = await this.databaseService.user.save(user);

    const accessToken = await this.generateAccessToken(savedUser.id);
    const refreshToken = await this.generateRefreshToken(savedUser.id);

    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.databaseService.user.update(savedUser.id, {
      hashedRefreshToken,
    });

    return {
      id: savedUser.id,
      email: savedUser.email,
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(userId: number) {
    const accessToken = await this.generateAccessToken(userId);
    const refreshToken = await this.generateRefreshToken(userId);

    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.databaseService.user.update(userId, { hashedRefreshToken });

    return { id: userId, accessToken, refreshToken };
  }

  async validateRefreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        this.refreshJwtConfiguration,
      );
      const userId = payload.sub;

      const user = await this.databaseService.user.findByIdOrFail(userId);
      if (!user?.hashedRefreshToken) return null;

      const isValid = await argon2.verify(
        user.hashedRefreshToken,
        refreshToken,
      );
      if (!isValid) return null;

      return user;
    } catch {
      return null;
    }
  }

  async signOut(userId: number) {
    await this.databaseService.user.update(userId, {
      hashedRefreshToken: null,
    });
  }

  async validateJwtUser(userId: number) {
    const user = await this.databaseService.user.findByIdOrFail(userId);
    if (!user) throw new UnauthorizedException('User not found!');

    return { id: user.id, role: user.role } as CurrentUser;
  }

  async validateGoogleUser(googleUser: CreateUserDto) {
    const user = await this.databaseService.user.findOne({
      where: { email: googleUser.email },
    });

    if (user) return user;

    return this.databaseService.user.save(
      this.databaseService.user.create(googleUser),
    );
  }
}
