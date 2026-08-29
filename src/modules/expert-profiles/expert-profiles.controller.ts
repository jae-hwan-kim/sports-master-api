import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiDataResponse } from '../../common/decorators/api-data-response.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateExpertProfileDto } from './dto/create-expert-profile.dto';
import { ExpertProfileResponseDto } from './dto/expert-profile-response.dto';
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
}
