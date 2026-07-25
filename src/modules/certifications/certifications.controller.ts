import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { ApiDataResponse } from '../../common/decorators/api-data-response.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CertificationsService } from './certifications.service';
import { CertificationResponseDto } from './dto/certification-response.dto';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { UpdateCertificationStatusDto } from './dto/update-certification-status.dto';

interface AuthenticatedRequest {
  user: { id: number };
}

const uploadDir = join(process.cwd(), process.env.UPLOAD_DIR ?? 'uploads', 'certifications');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

@ApiTags('certifications')
@Controller('certifications')
@UseGuards(JwtAuthGuard)
export class CertificationsController {
  constructor(private readonly certificationsService: CertificationsService) {}

  @ApiOperation({ summary: '자격증/졸업증명서 첨부 및 검수 요청' })
  @ApiConsumes('multipart/form-data')
  @ApiDataResponse(CertificationResponseDto)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadDir,
        filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`),
      }),
    }),
  )
  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateCertificationDto, @UploadedFile() file: Express.Multer.File) {
    return this.certificationsService.create(req.user.id, dto, file);
  }

  @ApiOperation({ summary: '내 자격증 검수 목록 조회' })
  @ApiDataResponse(CertificationResponseDto, { isArray: true })
  @Get('me')
  findMine(@Req() req: AuthenticatedRequest) {
    return this.certificationsService.findMine(req.user.id);
  }

  @ApiOperation({ summary: '[관리자] 전체 자격증 검수 목록' })
  @ApiDataResponse(CertificationResponseDto, { isArray: true })
  @Get()
  findAll() {
    return this.certificationsService.findAll();
  }

  @ApiOperation({ summary: '[관리자] 자격증 검수 상태 변경' })
  @ApiDataResponse(CertificationResponseDto)
  @Patch(':id/status')
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCertificationStatusDto) {
    return this.certificationsService.updateStatus(id, dto);
  }
}
