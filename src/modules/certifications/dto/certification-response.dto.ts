import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CertificationResponseDto {
  @ApiProperty({ description: '자격증 ID', example: 1 })
  id: number;

  @ApiProperty({
    description: '종류',
    enum: ['physical_therapist', 'health_exercise_manager', 'graduation_certificate', 'other'],
    example: 'physical_therapist',
  })
  type: string;

  @ApiProperty({ description: '검수 상태', enum: ['pending', 'approved', 'rejected'], example: 'pending' })
  status: string;

  @ApiProperty({ description: '파일 URL 목록', example: ['https://cdn.example.com/cert/1.jpg'] })
  fileUrls: string[];

  @ApiPropertyOptional({ description: '검수 완료일', example: '2024-02-01T10:00:00.000Z' })
  reviewedAt: Date | null;
}
