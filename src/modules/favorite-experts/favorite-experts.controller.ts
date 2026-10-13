import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiDataResponse } from '../../common/decorators/api-data-response.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FavoriteExpertItemDto } from './dto/favorite-expert-response.dto';
import { FavoriteStatusDto } from './dto/favorite-status.dto';
import { FavoriteExpertsService } from './favorite-experts.service';

interface AuthenticatedRequest {
  user: { id: number };
}

@ApiTags('favorite-experts')
@Controller('favorite-experts')
@UseGuards(JwtAuthGuard)
export class FavoriteExpertsController {
  constructor(private readonly favoriteExpertsService: FavoriteExpertsService) {}

  @ApiOperation({ summary: '찜 토글 — 없으면 추가, 있으면 해제' })
  @ApiDataResponse(FavoriteStatusDto)
  @Post(':expertProfileId')
  toggle(@Req() req: AuthenticatedRequest, @Param('expertProfileId', ParseIntPipe) expertProfileId: number) {
    return this.favoriteExpertsService.toggle(req.user.id, expertProfileId);
  }

  @ApiOperation({ summary: '찜 해제' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':expertProfileId')
  remove(@Req() req: AuthenticatedRequest, @Param('expertProfileId', ParseIntPipe) expertProfileId: number) {
    return this.favoriteExpertsService.remove(req.user.id, expertProfileId);
  }

  @ApiOperation({ summary: '찜 상태 조회' })
  @ApiDataResponse(FavoriteStatusDto)
  @Get(':expertProfileId/status')
  getStatus(@Req() req: AuthenticatedRequest, @Param('expertProfileId', ParseIntPipe) expertProfileId: number) {
    return this.favoriteExpertsService.getStatus(req.user.id, expertProfileId);
  }

  @ApiOperation({ summary: '내가 찜한 명인 목록' })
  @ApiDataResponse(FavoriteExpertItemDto, { isArray: true })
  @Get('me')
  getMyFavorites(@Req() req: AuthenticatedRequest) {
    return this.favoriteExpertsService.getMyFavorites(req.user.id);
  }
}
