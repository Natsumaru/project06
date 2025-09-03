import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiBody,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
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
}
