import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthProvider, User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

  async getMe(userId: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');
    return this.toDto(user);
  }

  async updateMe(userId: number, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    const isSocial = user.authProvider !== AuthProvider.LOCAL;

    if (isSocial && (dto.email || dto.currentPassword || dto.newPassword)) {
      throw new BadRequestException('소셜 로그인 사용자는 이메일/비밀번호를 변경할 수 없습니다.');
    }

    if (dto.phone !== undefined) user.phoneNumber = dto.phone;

    if (dto.email !== undefined && !isSocial) {
      user.email = dto.email;
    }

    if (dto.newPassword !== undefined && !isSocial) {
      if (!dto.currentPassword) throw new BadRequestException('현재 비밀번호를 입력해주세요.');
      const isMatch = await bcrypt.compare(dto.currentPassword, user.password ?? '');
      if (!isMatch) throw new UnauthorizedException('현재 비밀번호가 올바르지 않습니다.');
      user.password = await bcrypt.hash(dto.newPassword, 12);
    }

    const saved = await this.userRepository.save(user);
    return this.toDto(saved);
  }

  private toDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.nickname ?? '',
      phone: user.phoneNumber,
      personalCode: user.personalCode,
      currentMode: user.currentMode,
      socialProvider: user.authProvider,
      createdAt: user.createdAt,
    };
  }
}
