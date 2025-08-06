import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBody, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

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
      },
    },
  })
  @ApiResponse({ status: 401, description: '認証失敗' })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: LoginDto) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }
}
