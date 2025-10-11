import {
  Controller,
  Post,
  Get,
  Delete,
  UseInterceptors,
  UploadedFile,
  Param,
  BadRequestException,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MinioService } from './minio.service';
import {
  UploadResponseDto,
  FileListResponseDto,
} from './dto/upload-response.dto';
import { v4 as uuidv4 } from 'uuid';

@ApiTags('画像アップロード')
@Controller('upload')
export class UploadController {
  constructor(private readonly minioService: MinioService) {}

  @Post('image')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '画像ファイルをアップロード' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'アップロードする画像ファイル',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '画像が正常にアップロードされました',
    type: UploadResponseDto,
  })
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    if (!file) {
      throw new BadRequestException('ファイルが選択されていません');
    }

    // 画像ファイルの検証
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'サポートされていないファイル形式です。JPEG、PNG、GIF、WebPのみ対応しています。',
      );
    }

    // ファイルサイズの検証（10MB制限）
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException(
        'ファイルサイズが大きすぎます。10MB以下にしてください。',
      );
    }

    try {
      // ユニークなファイル名を生成
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;

      const url = await this.minioService.uploadFile(
        fileName,
        file.buffer,
        file.mimetype,
      );

      return {
        url,
        fileName,
        size: file.size,
        mimeType: file.mimetype,
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw new InternalServerErrorException(
        'ファイルのアップロードに失敗しました',
      );
    }
  }

  @Get('files')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'アップロードされたファイル一覧を取得' })
  @ApiResponse({
    status: 200,
    description: 'ファイル一覧を正常に取得しました',
    type: FileListResponseDto,
  })
  async getFiles(): Promise<FileListResponseDto> {
    try {
      const files = await this.minioService.listFiles();
      return { files };
    } catch (error) {
      console.error('List files error:', error);
      throw new InternalServerErrorException(
        'ファイル一覧の取得に失敗しました',
      );
    }
  }

  @Delete('file/:fileName')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'ファイルを削除' })
  @ApiResponse({
    status: 200,
    description: 'ファイルが正常に削除されました',
  })
  async deleteFile(@Param('fileName') fileName: string): Promise<void> {
    try {
      await this.minioService.deleteFile(fileName);
    } catch (error) {
      console.error('Delete file error:', error);
      throw new InternalServerErrorException('ファイルの削除に失敗しました');
    }
  }

  @Get('presigned/:fileName')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'ファイルの署名付きURLを取得' })
  @ApiResponse({
    status: 200,
    description: '署名付きURLを正常に生成しました',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: '署名付きURL',
        },
      },
    },
  })
  async getPresignedUrl(
    @Param('fileName') fileName: string,
  ): Promise<{ url: string }> {
    try {
      const url = await this.minioService.getPresignedUrl(fileName);
      return { url };
    } catch (error) {
      console.error('Presigned URL error:', error);
      throw new InternalServerErrorException('署名付きURLの生成に失敗しました');
    }
  }
}
