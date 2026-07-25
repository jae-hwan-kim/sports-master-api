import { Body, Controller, Delete, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiDataResponse } from '../../common/decorators/api-data-response.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { AppleLoginDto } from './dto/apple-login.dto';
import { AuthTokenResponseDto, MessageResponseDto, OAuthTokenResponseDto, TokenRefreshResponseDto } from './dto/auth-response.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { KakaoLoginDto } from './dto/kakao-login.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { WithdrawDto } from './dto/withdraw.dto';

interface AuthenticatedRequest {
  user: { id: number; currentMode: string };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '일반 회원가입 (이메일/비밀번호)' })
  @ApiDataResponse(AuthTokenResponseDto)
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: '일반 로그인 (이메일/비밀번호)' })
  @ApiDataResponse(AuthTokenResponseDto)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @ApiOperation({ summary: '카카오 OAuth 로그인/회원가입' })
  @ApiDataResponse(OAuthTokenResponseDto)
  @HttpCode(HttpStatus.OK)
  @Post('kakao')
  kakaoLogin(@Body() dto: KakaoLoginDto) {
    return this.authService.kakaoLogin(dto);
  }

  @ApiOperation({ summary: '애플 OAuth 로그인/회원가입 (iOS 필수)' })
  @ApiDataResponse(OAuthTokenResponseDto)
  @HttpCode(HttpStatus.OK)
  @Post('apple')
  appleLogin(@Body() dto: AppleLoginDto) {
    return this.authService.appleLogin(dto);
  }

  @ApiOperation({ summary: '구글 OAuth 로그인/회원가입' })
  @ApiDataResponse(OAuthTokenResponseDto)
  @HttpCode(HttpStatus.OK)
  @Post('google')
  googleLogin(@Body() dto: GoogleLoginDto) {
    return this.authService.googleLogin(dto);
  }

  @ApiOperation({ summary: 'Access Token 재발급 (자동 로그인)' })
  @ApiDataResponse(TokenRefreshResponseDto)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    const tokens = await this.authService.refresh(dto.refreshToken);
    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
  }

  @ApiOperation({ summary: '로그아웃 (refreshToken 무효화)' })
  @ApiDataResponse(MessageResponseDto)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Req() req: AuthenticatedRequest) {
    await this.authService.logout(req.user.id);
    return { message: '로그아웃되었습니다.' };
  }

  @ApiOperation({ summary: '회원탈퇴' })
  @ApiDataResponse(MessageResponseDto)
  @UseGuards(JwtAuthGuard)
  @Delete('withdraw')
  async withdraw(@Req() req: AuthenticatedRequest, @Body() dto: WithdrawDto) {
    await this.authService.withdraw(req.user.id, dto);
    return { message: '회원탈퇴가 완료되었습니다.' };
  }
}
