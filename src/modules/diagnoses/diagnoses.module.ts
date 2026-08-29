import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CustomerProfile } from '../customer-profiles/customer-profile.entity';
import { ExpertProfile } from '../expert-profiles/expert-profile.entity';
import { DiagnosisRequest } from './diagnosis-request.entity';
import { DiagnosesController } from './diagnoses.controller';
import { DiagnosesService } from './diagnoses.service';

@Module({
  imports: [TypeOrmModule.forFeature([DiagnosisRequest, ExpertProfile, CustomerProfile]), AuthModule],
  controllers: [DiagnosesController],
  providers: [DiagnosesService],
})
export class DiagnosesModule {}
