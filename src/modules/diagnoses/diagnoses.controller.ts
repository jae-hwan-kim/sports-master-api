import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiDataResponse } from '../../common/decorators/api-data-response.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DiagnosisIncomingItemDto } from './dto/diagnosis-response.dto';
import { DiagnosesService } from './diagnoses.service';

interface AuthenticatedRequest {
  user: { id: number };
}

@ApiTags('diagnoses')
@Controller('diagnoses')
@UseGuards(JwtAuthGuard)
export class DiagnosesController {
  constructor(private readonly diagnosesService: DiagnosesService) {}

  @ApiOperation({ summary: '진단요청 목록 조회 (명인용) — 신청순 전체' })
  @ApiDataResponse(DiagnosisIncomingItemDto, { isArray: true })
  @Get('incoming')
  getIncoming(@Req() req: AuthenticatedRequest) {
    return this.diagnosesService.getIncoming(req.user.id);
  }

  @ApiOperation({ summary: '진단요청 열람 처리 (명인용) — isViewed를 true로 변경' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch(':id/view')
  markAsViewed(@Req() req: AuthenticatedRequest, @Param('id', ParseIntPipe) id: number) {
    return this.diagnosesService.markAsViewed(req.user.id, id);
  }

  @ApiOperation({ summary: '진단요청 삭제 (명인용) — status를 deleted로 변경' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteRequest(@Req() req: AuthenticatedRequest, @Param('id', ParseIntPipe) id: number) {
    return this.diagnosesService.deleteRequest(req.user.id, id);
  }
}
