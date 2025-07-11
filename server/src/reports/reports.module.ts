import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { PatroniReport } from '../entities/patroni-report.entity';
import { HeartbeatReport } from '../entities/heartbeat-report.entity';
import { DatabaseReport } from '../entities/database-report.entity';
import { WarningReport } from '../entities/warning-report.entity';
import { NemsmReport } from '../entities/nemsm-report.entity';
import { Report } from '../entities/report.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Report,
      PatroniReport,
      HeartbeatReport,
      DatabaseReport,
      WarningReport,
      NemsmReport,
    ]),
    AuthModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {} 