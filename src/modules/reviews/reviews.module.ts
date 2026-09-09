import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ExpertProfile } from '../expert-profiles/expert-profile.entity';
import { ReviewDeleteRequest } from './review-delete-request.entity';
import { Review } from './review.entity';
import { ReviewsController } from './review.controller';
import { ReviewsService } from './review.service';

@Module({
  imports: [TypeOrmModule.forFeature([Review, ReviewDeleteRequest, ExpertProfile]), AuthModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
