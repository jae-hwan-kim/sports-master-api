import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ChatRoom } from '../chat-rooms/chat-room.entity';
import { DiagnosisRequest } from '../diagnoses/diagnosis-request.entity';
import { ExpertProfile } from '../expert-profiles/expert-profile.entity';
import { User } from '../users/user.entity';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, ExpertProfile, DiagnosisRequest, ChatRoom]), AuthModule],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
