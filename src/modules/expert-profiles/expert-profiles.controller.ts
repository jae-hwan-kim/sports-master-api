import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseFloatPipe,
  ParseEnumPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiDataResponse } from '../../common/decorators/api-data-response.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateExpertProfileDto } from './dto/create-expert-profile.dto';
import { ExpertListItemDto } from './dto/expert-list-item.dto';
import { ExpertProfileResponseDto, UploadedFilesResponseDto } from './dto/expert-profile-response.dto';
import { UpdateExpertProfileDto } from './dto/update-expert-profile.dto';
import { ExpertProfilesService } from './expert-profiles.service';

const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic']);
const PDF_MIME_TYPES = new Set(['application/pdf']);

interface AuthenticatedRequest {
  user: { id: number };
}

@ApiTags('expert-profiles')
@Controller('expert-profiles')
@UseGuards(JwtAuthGuard)
export class ExpertProfilesController {
  constructor(private readonly expertProfilesService: ExpertProfilesService) {}

  @ApiOperation({ summary: '명인 프로필 최초 생성' })
  @ApiDataResponse(ExpertProfileResponseDto)
  @Post('me')
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateExpertProfileDto) {
    return this.expertProfilesService.create(req.user.id, dto);
  }

  @ApiOperation({ summary: '내 명인 프로필 조회' })
  @ApiDataResponse(ExpertProfileResponseDto)
  @Get('me')
  getMe(@Req() req: AuthenticatedRequest) {
    return this.expertProfilesService.getMe(req.user.id);
  }

  @ApiOperation({ summary: '명인 목록 조회 (고객 명인탐색) — 필터 없으면 전체' })
  @ApiDataResponse(ExpertListItemDto, { isArray: true })
  @Get()
  list(
    @Query('q') q?: string,
    @Query('region') region?: string,
    @Query('minRating', new ParseFloatPipe({ optional: true })) minRating?: number,
  ) {
    return this.expertProfilesService.list({ q, region, minRating });
  }

  @ApiOperation({ summary: '명인 프로필 상세 조회 (고객용)' })
  @ApiDataResponse(ExpertProfileResponseDto)
  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.expertProfilesService.getById(id);
  }

  @ApiOperation({ summary: '내 명인 프로필 수정' })
  @ApiDataResponse(ExpertProfileResponseDto)
  @Patch('me')
  updateMe(@Req() req: AuthenticatedRequest, @Body() dto: UpdateExpertProfileDto) {
    return this.expertProfilesService.updateMe(req.user.id, dto);
  }

  @ApiOperation({ summary: '프로필 파일 업로드 (이미지 최대 3장 / PDF 1개) — URL만 반환, 저장은 PATCH me' })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({ name: 'kind', enum: ['image', 'pdf'] })
  @ApiDataResponse(UploadedFilesResponseDto)
  @Post('me/uploads')
  @UseInterceptors(
    FilesInterceptor('files', 3, {
      limits: { fileSize: 100 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const allowed = req.query.kind === 'pdf' ? PDF_MIME_TYPES : IMAGE_MIME_TYPES;
        if (!allowed.has(file.mimetype)) {
          cb(new BadRequestException('허용되지 않는 파일 형식입니다.'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  uploadFiles(
    @Req() req: AuthenticatedRequest,
    @Query('kind', new ParseEnumPipe(['image', 'pdf'])) kind: 'image' | 'pdf',
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.expertProfilesService.uploadFiles(req.user.id, kind, files);
  }
}
