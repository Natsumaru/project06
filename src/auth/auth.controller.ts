import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBody,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { GetUser } from './decorator/get-user.decorator';

@ApiTags('認証')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'ユーザーログイン' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'ログイン成功',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string', description: 'JWTアクセストークン' },
        refresh_token: { type: 'string', description: 'リフレッシュトークン' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '認証失敗' })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: LoginDto) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @ApiOperation({ summary: 'トークンリフレッシュ' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'トークン更新成功',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          description: '新しいJWTアクセストークン',
        },
        refresh_token: {
          type: 'string',
          description: '新しいリフレッシュトークン',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '無効なリフレッシュトークン' })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refresh_token);
  }

  @ApiOperation({ summary: 'ログアウト' })
  @ApiBearerAuth('JWT')
  @ApiResponse({
    status: 200,
    description: 'ログアウト成功',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Successfully logged out' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '認証が必要' })
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@GetUser() user: { id: string }) {
    await this.authService.logout(user.id);
    return { message: 'Successfully logged out' };
  }
}
