import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ExpertProfile } from '../expert-profiles/expert-profile.entity';
import { CustomerProfile } from '../customer-profiles/customer-profile.entity';
import { AiRecommendationsController } from './ai-recommendations.controller';
import { AiRecommendationsService } from './ai-recommendations.service';

@Module({
  imports: [TypeOrmModule.forFeature([ExpertProfile, CustomerProfile]), AuthModule],
  controllers: [AiRecommendationsController],
  providers: [AiRecommendationsService],
})
export class AiRecommendationsModule {}
