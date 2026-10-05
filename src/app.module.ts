import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { loggerConfig } from './config/logger.config';
import { AuthModule } from './modules/auth/auth.module';
import { CertificationsModule } from './modules/certifications/certifications.module';
import { DiagnosesModule } from './modules/diagnoses/diagnoses.module';
import { ExpertProfilesModule } from './modules/expert-profiles/expert-profiles.module';
import { HomeModule } from './modules/home/home.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    WinstonModule.forRoot(loggerConfig),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL');
        const isProduction = config.get('NODE_ENV') === 'production';
        if (databaseUrl) {
          return {
            type: 'postgres' as const,
            url: databaseUrl,
            ssl: { rejectUnauthorized: false },
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: !isProduction,
            migrations: [__dirname + '/migrations/**/*.{ts,js}'],
            migrationsRun: isProduction,
          };
        }
        return {
          type: 'postgres' as const,
          host: config.get('DB_HOST'),
          port: config.get<number>('DB_PORT'),
          database: config.get<string>('DB_NAME'),
          username: config.get<string>('DB_USER'),
          password: config.get<string>('DB_PASSWORD'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: !isProduction,
          migrations: [__dirname + '/migrations/**/*.{ts,js}'],
          migrationsRun: isProduction,
          ssl: config.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
        };
      },
    }),
    AuthModule,
    CertificationsModule,
    DiagnosesModule,
    ExpertProfilesModule,
    HomeModule,
    ReviewsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor }],
})
export class AppModule {}
