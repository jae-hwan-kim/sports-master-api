import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ChatRoom } from '../chat-rooms/chat-room.entity';
import { DiagnosisRequest } from '../diagnoses/diagnosis-request.entity';
import { ExpertProfile } from '../expert-profiles/expert-profile.entity';
import { ReviewDeleteRequest } from './review-delete-request.entity';
import { Review } from './review.entity';
import { ReviewLinkPageController } from './review-link-page.controller';
import { ReviewsController } from './review.controller';
import { ReviewsService } from './review.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, ReviewDeleteRequest, ExpertProfile, DiagnosisRequest, ChatRoom]),
    AuthModule,
  ],
  controllers: [ReviewsController, ReviewLinkPageController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
