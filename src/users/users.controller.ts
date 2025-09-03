import { Controller, Post, Body, UseGuards, Get, Put } from '@nestjs/common';
import {
  ApiTags,
  ApiBody,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorator/get-user.decorator';

@ApiTags('ユーザー')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'ユーザー登録' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'ユーザー登録成功',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'ユーザーID' },
            email: { type: 'string', description: 'メールアドレス' },
            nickname: { type: 'string', description: 'ニックネーム' },
            sex: {
              type: 'string',
              enum: ['MALE', 'FEMALE'],
              description: '性別',
            },
            profileImage: {
              type: 'string',
              nullable: true,
              description: 'プロフィール画像',
            },
          },
        },
        access_token: { type: 'string', description: 'JWTアクセストークン' },
        refresh_token: { type: 'string', description: 'リフレッシュトークン' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'バリデーションエラー' })
  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiOperation({ summary: 'ユーザープロフィール取得' })
  @ApiBearerAuth('JWT')
  @ApiResponse({
    status: 200,
    description: 'プロフィール取得成功',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'ユーザーID' },
        email: { type: 'string', description: 'メールアドレス' },
        nickname: { type: 'string', description: 'ニックネーム' },
        sex: { type: 'string', enum: ['MALE', 'FEMALE'], description: '性別' },
        profileImage: {
          type: 'string',
          nullable: true,
          description: 'プロフィール画像',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '認証が必要' })
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getProfile(@GetUser() user: { id: string; email: string }) {
    return this.usersService.findOneById(user.id);
  }

  @ApiOperation({ summary: 'ユーザープロフィール更新' })
  @ApiBearerAuth('JWT')
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'プロフィール更新成功',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'ユーザーID' },
        email: { type: 'string', description: 'メールアドレス' },
        nickname: { type: 'string', description: 'ニックネーム' },
        sex: { type: 'string', enum: ['MALE', 'FEMALE'], description: '性別' },
        gender: {
          type: 'string',
          enum: ['MALE', 'FEMALE', 'OTHER', 'UNSPECIFIED'],
          description: 'ジェンダー',
        },
        ageGroup: {
          type: 'string',
          enum: [
            'TEENS',
            'TWENTIES_EARLY',
            'TWENTIES_LATE',
            'THIRTIES_EARLY',
            'THIRTIES_LATE',
            'FORTIES',
            'FIFTIES_AND_UP',
          ],
          description: '年齢層',
        },
        profileImage: {
          type: 'string',
          nullable: true,
          description: 'プロフィール画像',
        },
        introduction: {
          type: 'string',
          nullable: true,
          description: '自己紹介',
        },
        isIdentityVerified: {
          type: 'boolean',
          description: '身分証明書認証済み',
        },
        isCertifiedOwner: {
          type: 'boolean',
          description: '認証済みオーナー',
        },
        createdAt: { type: 'string', description: '作成日時' },
        updatedAt: { type: 'string', description: '更新日時' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '認証が必要' })
  @ApiResponse({ status: 404, description: 'ユーザーが見つかりません' })
  @ApiResponse({
    status: 409,
    description: 'メールアドレスが既に使用されています',
  })
  @UseGuards(AuthGuard('jwt'))
  @Put('profile')
  async updateProfile(
    @GetUser() user: { id: string; email: string },
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(user.id, updateUserDto);
  }
}
