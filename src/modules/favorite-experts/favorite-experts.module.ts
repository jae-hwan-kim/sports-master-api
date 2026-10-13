import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ExpertProfile } from '../expert-profiles/expert-profile.entity';
import { FavoriteExpert } from './favorite-expert.entity';
import { FavoriteExpertsController } from './favorite-experts.controller';
import { FavoriteExpertsService } from './favorite-experts.service';

@Module({
  imports: [TypeOrmModule.forFeature([FavoriteExpert, ExpertProfile]), AuthModule],
  controllers: [FavoriteExpertsController],
  providers: [FavoriteExpertsService],
})
export class FavoriteExpertsModule {}
