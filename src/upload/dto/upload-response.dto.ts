import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({ description: 'アップロードされたファイルのURL' })
  url: string;

  @ApiProperty({ description: 'アップロードされたファイル名' })
  fileName: string;

  @ApiProperty({ description: 'ファイルサイズ（バイト）' })
  size: number;

  @ApiProperty({ description: 'MIMEタイプ' })
  mimeType: string;
}

export class FileListResponseDto {
  @ApiProperty({
    description: 'アップロードされたファイル一覧',
    type: [String],
  })
  files: string[];
}
