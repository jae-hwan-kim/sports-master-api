import { randomUUID } from 'crypto';
import { extname } from 'path';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Cloudflare R2(S3 호환) 파일 저장소 — 업로드 후 공개 URL(R2_PUBLIC_BASE_URL/key)을 반환
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client | null;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor(config: ConfigService) {
    const accountId = config.get<string>('R2_ACCOUNT_ID');
    const accessKeyId = config.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = config.get<string>('R2_SECRET_ACCESS_KEY');
    this.bucket = config.get<string>('R2_BUCKET') ?? '';
    this.publicBaseUrl = (config.get<string>('R2_PUBLIC_BASE_URL') ?? '').replace(/\/$/, '');

    // 설정이 없으면 서버는 뜨되 업로드 요청만 500 — 로컬 개발에서 R2 없이도 다른 API 사용 가능
    this.client =
      accountId && accessKeyId && secretAccessKey && this.bucket && this.publicBaseUrl
        ? new S3Client({
            region: 'auto',
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            credentials: { accessKeyId, secretAccessKey },
          })
        : null;
    if (!this.client) this.logger.warn('R2 환경변수가 없어 파일 업로드가 비활성화됩니다.');
  }

  /** folder 예: `experts/12/images` — 원본 파일명은 쓰지 않고 uuid로 저장(한글·공백 URL 깨짐 방지) */
  async upload(file: Express.Multer.File, folder: string): Promise<string> {
    if (!this.client) throw new InternalServerErrorException('파일 저장소가 설정되지 않았습니다.');
    const key = `${folder}/${randomUUID()}${extname(file.originalname).toLowerCase()}`;
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );
    return `${this.publicBaseUrl}/${key}`;
  }

  /** 이 저장소의 공개 URL인지 — 클라이언트가 임의 URL을 프로필에 넣지 못하게 검증용 */
  isOwnUrl(url: string): boolean {
    return !!this.publicBaseUrl && url.startsWith(`${this.publicBaseUrl}/`);
  }

  /** 삭제 실패는 사용자 흐름을 막지 않도록 로그만 남김 */
  async deleteByUrl(url: string): Promise<void> {
    if (!this.client || !this.isOwnUrl(url)) return;
    const key = url.slice(this.publicBaseUrl.length + 1);
    try {
      await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    } catch (error) {
      this.logger.error(`R2 파일 삭제 실패: ${key}`, (error as Error).stack);
    }
  }
}
