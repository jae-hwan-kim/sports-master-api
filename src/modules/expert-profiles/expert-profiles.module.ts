import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ExpertProfilesController } from './expert-profiles.controller';
import { ExpertProfilesService } from './expert-profiles.service';
import { ExpertProfile } from './expert-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExpertProfile]), AuthModule],
  controllers: [ExpertProfilesController],
  providers: [ExpertProfilesService],
  exports: [ExpertProfilesService],
})
export class ExpertProfilesModule {}
