import {
  Injectable,
  ConflictException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcript from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<{
    user: {
      id: string;
      email: string;
      nickname: string;
      sex: string;
      profileImage: string | null;
    };
    access_token: string;
    refresh_token: string;
  }> {
    const { email, password: plainPassword, nickname, sex } = createUserDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcript.hash(plainPassword, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nickname,
        sex,
      },
    });

    // パスワードとリフレッシュトークン関連のフィールドを除外したユーザー情報
    const userResult = {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      sex: user.sex,
      profileImage: user.profileImage,
    };

    // トークンを生成
    const tokens = await this.authService.generateTokensForUser(
      user.id,
      user.email,
    );

    return {
      user: userResult,
      ...tokens,
    };
  }

  async findOneByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findOneById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // ユーザーが存在するかチェック
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // メールアドレスが変更される場合、他のユーザーが使用していないかチェック
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (emailExists) {
        throw new ConflictException('User with this email already exists');
      }
    }

    // パスワードがある場合はハッシュ化
    let hashedPassword: string | undefined;
    if (updateUserDto.password) {
      hashedPassword = await bcript.hash(updateUserDto.password, 10);
    }

    // ユーザー情報を更新
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...updateUserDto,
        password: hashedPassword || existingUser.password, // パスワードが提供されていない場合は既存のパスワードを保持
      },
    });

    // パスワードを除外して返却
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = updatedUser;
    return result;
  }
}
