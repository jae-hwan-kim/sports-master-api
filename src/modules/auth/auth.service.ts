import { randomBytes, createHash } from 'crypto';
import { BadRequestException, ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import * as jwt from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';
import { Repository } from 'typeorm';
import { requireEnv } from '../../common/config/require-env';
import { AuthProvider, User, UserMode } from '../users/user.entity';
import { RefreshToken } from './refresh-token.entity';
import { AppleLoginDto } from './dto/apple-login.dto';
import { AuthTokenResponseDto, AuthUserDto, OAuthTokenResponseDto } from './dto/auth-response.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { KakaoLoginDto } from './dto/kakao-login.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { WithdrawDto } from './dto/withdraw.dto';

const APPLE_JWKS_URI = 'https://appleid.apple.com/auth/keys';
const APPLE_ISSUER = 'https://appleid.apple.com';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly appleJwksClient = new JwksClient({ jwksUri: APPLE_JWKS_URI });

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken) private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthTokenResponseDto> {
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('이미 가입된 이메일입니다.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.userRepository.save(
      this.userRepository.create({
        email: dto.email,
        password: hashedPassword,
        nickname: dto.nickname,
        phoneNumber: dto.phone ?? null,
        authProvider: AuthProvider.LOCAL,
        currentMode: (dto.mode as unknown as UserMode) ?? UserMode.CUSTOMER,
        // register()는 앱에서 항상 SignUpRoleSelect에서 명시적으로 고른 mode와 함께 호출됨
        hasSelectedMode: true,
        personalCode: await this.generatePersonalCode(),
      }),
    );

    return this.issueTokens(user);
  }

  async login(dto: LoginDto): Promise<AuthTokenResponseDto> {
    const user = await this.userRepository.findOne({ where: { email: dto.email } });
    if (!user || !user.password) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    return this.issueTokens(user);
  }

  async kakaoLogin(dto: KakaoLoginDto): Promise<OAuthTokenResponseDto> {
    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.config.get<string>('KAKAO_REST_API_KEY') ?? '',
        redirect_uri: this.config.get<string>('KAKAO_REDIRECT_URI') ?? '',
        code: dto.code,
      }),
    });
    if (!tokenRes.ok) {
      throw new UnauthorizedException('카카오 인가코드 검증에 실패했습니다.');
    }
    const { access_token: kakaoAccessToken } = (await tokenRes.json()) as { access_token: string };

    const profileRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${kakaoAccessToken}` },
    });
    if (!profileRes.ok) {
      throw new UnauthorizedException('카카오 사용자 정보 조회에 실패했습니다.');
    }
    const profile = (await profileRes.json()) as {
      id: number;
      kakao_account?: { email?: string };
    };

    return this.findOrCreateSocialUser({
      provider: AuthProvider.KAKAO,
      socialId: String(profile.id),
      email: profile.kakao_account?.email ?? null,
    });
  }

  async appleLogin(dto: AppleLoginDto): Promise<OAuthTokenResponseDto> {
    const decoded = jwt.decode(dto.identityToken, { complete: true });
    if (!decoded || typeof decoded === 'string' || !decoded.header.kid) {
      throw new UnauthorizedException('유효하지 않은 애플 identityToken입니다.');
    }

    const signingKey = await this.appleJwksClient.getSigningKey(decoded.header.kid);
    const payload = jwt.verify(dto.identityToken, signingKey.getPublicKey(), {
      algorithms: ['RS256'],
      issuer: APPLE_ISSUER,
      audience: this.config.get<string>('APPLE_CLIENT_ID'),
    }) as jwt.JwtPayload;

    return this.findOrCreateSocialUser({
      provider: AuthProvider.APPLE,
      socialId: String(payload.sub),
      email: (payload.email as string | undefined) ?? null,
    });
  }

  async googleLogin(dto: GoogleLoginDto): Promise<OAuthTokenResponseDto> {
    const client = new OAuth2Client(this.config.get<string>('GOOGLE_CLIENT_ID'));
    const ticket = await client
      .verifyIdToken({ idToken: dto.idToken, audience: this.config.get<string>('GOOGLE_CLIENT_ID') })
      .catch(() => {
        throw new UnauthorizedException('유효하지 않은 구글 idToken입니다.');
      });
    const payload = ticket.getPayload();
    if (!payload?.sub) {
      throw new UnauthorizedException('구글 사용자 정보를 확인할 수 없습니다.');
    }

    return this.findOrCreateSocialUser({
      provider: AuthProvider.GOOGLE,
      socialId: payload.sub,
      email: payload.email ?? null,
    });
  }

  async refresh(refreshToken: string): Promise<AuthTokenResponseDto> {
    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.refreshTokenRepository.findOne({ where: { tokenHash } });
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh Token이 만료되었거나 유효하지 않습니다.');
    }

    const user = await this.userRepository.findOne({ where: { id: stored.userId } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('유효하지 않은 사용자입니다.');
    }

    await this.refreshTokenRepository.delete({ id: stored.id });
    const tokens = await this.issueTokens(user);
    return { user: tokens.user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
  }

  async logout(userId: number): Promise<void> {
    await this.refreshTokenRepository.delete({ userId });
  }

  async withdraw(userId: number, dto: WithdrawDto): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('유효하지 않은 사용자입니다.');
    }

    if (user.authProvider === AuthProvider.LOCAL) {
      if (!dto.password || !user.password || !(await bcrypt.compare(dto.password, user.password))) {
        throw new BadRequestException('비밀번호가 올바르지 않습니다.');
      }
    }

    await this.refreshTokenRepository.delete({ userId });
    await this.userRepository.softDelete(userId);
  }

  private async findOrCreateSocialUser(params: {
    provider: AuthProvider;
    socialId: string;
    email: string | null;
  }): Promise<OAuthTokenResponseDto> {
    let user = await this.userRepository.findOne({
      where: { authProvider: params.provider, socialId: params.socialId },
    });
    let isNewUser = false;

    if (!user && params.email) {
      const existingByEmail = await this.userRepository.findOne({ where: { email: params.email } });
      if (existingByEmail) {
        throw new ConflictException('이미 다른 방식으로 가입된 이메일입니다. 기존 로그인 방식을 이용해주세요.');
      }
    }

    if (!user) {
      user = await this.userRepository.save(
        this.userRepository.create({
          email: params.email,
          authProvider: params.provider,
          socialId: params.socialId,
          currentMode: UserMode.CUSTOMER,
          personalCode: await this.generatePersonalCode(),
        }),
      );
      isNewUser = true;
    }

    const tokens = await this.issueTokens(user);
    return { ...tokens, isNewUser };
  }

  private async issueTokens(user: User): Promise<AuthTokenResponseDto> {
    const payload = { sub: user.id, currentMode: user.currentMode };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: requireEnv(this.config, 'JWT_ACCESS_SECRET'),
      expiresIn: (this.config.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '1h') as unknown as number,
    });
    const refreshTokenExpiresIn = this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '30d';
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: requireEnv(this.config, 'JWT_REFRESH_SECRET'),
      expiresIn: refreshTokenExpiresIn as unknown as number,
    });

    await this.refreshTokenRepository.save(
      this.refreshTokenRepository.create({
        userId: user.id,
        tokenHash: this.hashToken(refreshToken),
        expiresAt: this.addDuration(new Date(), refreshTokenExpiresIn),
      }),
    );

    const authUser: AuthUserDto = {
      id: user.id,
      email: user.email ?? '',
      name: user.nickname ?? '',
      personalCode: user.personalCode,
      currentMode: user.currentMode,
      socialProvider: user.authProvider,
      hasSelectedMode: user.hasSelectedMode,
      hasSubmittedCertification: user.hasSubmittedCertification,
    };

    return { user: authUser, accessToken, refreshToken };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private addDuration(base: Date, duration: string): Date {
    const match = /^(\d+)([smhd])$/.exec(duration);
    if (!match) {
      return new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000);
    }
    const value = Number(match[1]);
    const unitMs = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[match[2] as 's' | 'm' | 'h' | 'd'];
    return new Date(base.getTime() + value * unitMs);
  }

  private async generatePersonalCode(): Promise<string> {
    let code: string;
    let exists: User | null;
    do {
      code = `USR-${randomBytes(3).toString('hex').toUpperCase()}`;
      exists = await this.userRepository.findOne({ where: { personalCode: code } });
    } while (exists);
    return code;
  }
}
