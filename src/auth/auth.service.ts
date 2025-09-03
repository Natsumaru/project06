import {
  Injectable,
  UnauthorizedException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async signIn(
    email: string,
    pass: string,
  ): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.generateTokensForUser(user.id, user.email);
  }

  async generateTokensForUser(
    userId: string,
    userEmail: string,
  ): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    const payload = { sub: userId, email: userEmail };
    const accessToken = await this.jwtService.signAsync(payload);

    // リフレッシュトークンを生成
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const refreshTokenExpiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    ); // 7日後

    // リフレッシュトークンをDBに保存
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken: await bcrypt.hash(refreshToken, 10),
        refreshTokenExpiresAt,
      },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshToken(refreshToken: string): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    // すべてのユーザーからリフレッシュトークンを検索
    const users = await this.prisma.user.findMany({
      where: {
        refreshToken: { not: null },
        refreshTokenExpiresAt: { gt: new Date() },
      },
    });

    let validUser: { id: string; email: string } | null = null;
    for (const user of users) {
      if (user.refreshToken && typeof user.refreshToken === 'string') {
        const isValid = await bcrypt.compare(
          refreshToken,
          user.refreshToken as string,
        );
        if (isValid) {
          validUser = { id: user.id, email: user.email };
          break;
        }
      }
    }

    if (!validUser) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // 新しいアクセストークンとリフレッシュトークンを生成
    return this.generateTokensForUser(validUser.id, validUser.email);
  }

  async logout(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken: null,
        refreshTokenExpiresAt: null,
      },
    });
  }
}
