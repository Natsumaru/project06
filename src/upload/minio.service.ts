import { Injectable } from '@nestjs/common';
import { Client } from 'minio';

@Injectable()
export class MinioService {
  private minioClient: Client;
  private bucketName: string;
  private minioEndpoint: string;
  private minioPort: number;

  constructor() {
    this.minioEndpoint =
      process.env.MINIO_ENDPOINT?.replace('http://', '') || 'minio';
    this.minioPort = parseInt(process.env.MINIO_PORT || '9000');

    this.minioClient = new Client({
      endPoint: this.minioEndpoint,
      port: this.minioPort,
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY || 'root_user',
      secretKey: process.env.MINIO_SECRET_KEY || 'root_password',
    });

    this.bucketName = process.env.MINIO_BUCKET_NAME || 'nest-bucket';
    void this.ensureBucket();
  }

  private async ensureBucket(): Promise<void> {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        console.log(`Bucket '${this.bucketName}' created successfully.`);
      }
    } catch (error) {
      console.error('Error creating bucket:', error);
    }
  }

  async uploadFile(
    fileName: string,
    file: Buffer,
    contentType: string,
  ): Promise<string> {
    try {
      await this.minioClient.putObject(
        this.bucketName,
        fileName,
        file,
        file.length,
        {
          'Content-Type': contentType,
        },
      );
      // 環境変数から動的にURLを構築
      const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
      const publicEndpoint =
        process.env.MINIO_PUBLIC_ENDPOINT || this.minioEndpoint;
      const publicPort = process.env.MINIO_PUBLIC_PORT || this.minioPort;

      return `${protocol}://${publicEndpoint}:${publicPort}/${this.bucketName}/${fileName}`;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async getPresignedUrl(
    fileName: string,
    expiry = 7 * 24 * 60 * 60,
  ): Promise<string> {
    try {
      return await this.minioClient.presignedGetObject(
        this.bucketName,
        fileName,
        expiry,
      );
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw error;
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucketName, fileName);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  async listFiles(): Promise<string[]> {
    try {
      const objectsStream = this.minioClient.listObjects(this.bucketName);
      const files: string[] = [];

      return new Promise((resolve, reject) => {
        objectsStream.on('data', (obj) => {
          if (obj.name) {
            files.push(obj.name);
          }
        });

        objectsStream.on('end', () => {
          resolve(files);
        });

        objectsStream.on('error', (err) => {
          reject(err);
        });
      });
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  }
}
