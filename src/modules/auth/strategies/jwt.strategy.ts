import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { requireEnv } from '../../../common/config/require-env';
import { User } from '../../users/user.entity';

export interface JwtPayload {
  sub: number;
  currentMode: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: requireEnv(config, 'JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    // 리뷰 요청 토큰 등 sub 없는 토큰은 access token으로 사용 불가
    if (!payload.sub) throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    const user = await this.userRepository.findOne({ where: { id: payload.sub } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('유효하지 않은 사용자입니다.');
    }
    return { id: user.id, currentMode: user.currentMode };
  }
}
