import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CustomerProfile } from './customer-profile.entity';
import { CustomerProfilesController } from './customer-profiles.controller';
import { CustomerProfilesService } from './customer-profiles.service';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerProfile]), AuthModule],
  controllers: [CustomerProfilesController],
  providers: [CustomerProfilesService],
  exports: [CustomerProfilesService],
})
export class CustomerProfilesModule {}
