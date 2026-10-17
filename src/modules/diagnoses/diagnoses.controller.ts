import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiDataResponse } from '../../common/decorators/api-data-response.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateDiagnosisRequestDto } from './dto/create-diagnosis-request.dto';
import { DiagnosisSentItemDto, DiagnosisIncomingItemDto, DiagnosisRequestResponseDto } from './dto/diagnosis-response.dto';
import { DiagnosesService } from './diagnoses.service';

interface AuthenticatedRequest {
  user: { id: number };
}

@ApiTags('diagnoses')
@Controller('diagnoses')
@UseGuards(JwtAuthGuard)
export class DiagnosesController {
  constructor(private readonly diagnosesService: DiagnosesService) {}

  @ApiOperation({ summary: '내가 진단요청한 명인 목록 조회 (고객용) — 리뷰 작성 여부 포함' })
  @ApiDataResponse(DiagnosisSentItemDto, { isArray: true })
  @Get('my-sent')
  getMySent(@Req() req: AuthenticatedRequest) {
    return this.diagnosesService.getMySent(req.user.id);
  }

  @ApiOperation({ summary: '진단요청 생성 (고객용)' })
  @ApiDataResponse(DiagnosisRequestResponseDto)
  @Post()
  createRequest(@Req() req: AuthenticatedRequest, @Body() dto: CreateDiagnosisRequestDto) {
    return this.diagnosesService.createRequest(req.user.id, dto);
  }

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
