import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { ApiDataResponse } from '../../common/decorators/api-data-response.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CustomerProfileResponseDto } from './dto/customer-profile-response.dto';
import { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';
import { CustomerProfilesService } from './customer-profiles.service';

interface AuthenticatedRequest {
  user: { id: number };
}

class RegionsResponseDto {
  @ApiProperty({ description: '지역 목록', example: ['서울', '경기', '인천'] })
  regions: string[];
}

@ApiTags('customer-profiles')
@Controller('customer-profiles')
@UseGuards(JwtAuthGuard)
export class CustomerProfilesController {
  constructor(private readonly service: CustomerProfilesService) {}

  @ApiOperation({ summary: '선택 가능한 지역 목록 조회' })
  @ApiDataResponse(RegionsResponseDto)
  @Get('regions')
  getRegions() {
    return { regions: this.service.getRegions() };
  }

  @ApiOperation({ summary: '내 고객 프로필 조회' })
  @ApiDataResponse(CustomerProfileResponseDto)
  @Get('me')
  getMe(@Req() req: AuthenticatedRequest) {
    return this.service.getMe(req.user.id);
  }

  @ApiOperation({ summary: '내 고객 프로필 수정 (온보딩 포함)' })
  @ApiDataResponse(CustomerProfileResponseDto)
  @Patch('me')
  updateMe(@Req() req: AuthenticatedRequest, @Body() dto: UpdateCustomerProfileDto) {
    return this.service.updateMe(req.user.id, dto);
  }
}
