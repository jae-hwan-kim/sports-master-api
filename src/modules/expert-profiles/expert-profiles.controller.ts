import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiDataResponse } from '../../common/decorators/api-data-response.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateExpertProfileDto } from './dto/create-expert-profile.dto';
import { ExpertProfileResponseDto, ImageUploadResponseDto } from './dto/expert-profile-response.dto';
import { UpdateExpertProfileDto } from './dto/update-expert-profile.dto';
import { ExpertProfilesService } from './expert-profiles.service';

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

  @ApiOperation({ summary: '내 명인 프로필 수정' })
  @ApiDataResponse(ExpertProfileResponseDto)
  @Patch('me')
  updateMe(@Req() req: AuthenticatedRequest, @Body() dto: UpdateExpertProfileDto) {
    return this.expertProfilesService.updateMe(req.user.id, dto);
  }

  @ApiOperation({ summary: '프로필 이미지 업로드' })
  @ApiConsumes('multipart/form-data')
  @ApiDataResponse(ImageUploadResponseDto)
  @Post('me/images')
  @UseInterceptors(FilesInterceptor('files', 10))
  uploadImages(@Req() req: AuthenticatedRequest, @UploadedFiles() files: Express.Multer.File[]) {
    return this.expertProfilesService.uploadImages(req.user.id, files);
  }

  @ApiOperation({ summary: '프로필 이미지 삭제 (인덱스 기준)' })
  @ApiDataResponse(ImageUploadResponseDto)
  @Delete('me/images/:index')
  deleteImage(@Req() req: AuthenticatedRequest, @Param('index', ParseIntPipe) index: number) {
    return this.expertProfilesService.deleteImage(req.user.id, index);
  }

  @ApiOperation({ summary: '자격증 이미지 업로드' })
  @ApiConsumes('multipart/form-data')
  @ApiDataResponse(ImageUploadResponseDto)
  @Post('me/certificates')
  @UseInterceptors(FilesInterceptor('files', 10))
  uploadCertificates(@Req() req: AuthenticatedRequest, @UploadedFiles() files: Express.Multer.File[]) {
    return this.expertProfilesService.uploadCertificates(req.user.id, files);
  }
}
