import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './report.entity';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { NemsmReport } from '../entities/nemsm-report.entity';
import { NemsmReportsService } from './nemsm-reports.service';
import { NemsmReportsController } from './nemsm-reports.controller';
import { ApisixReport } from '../entities/apisix-report.entity';
import { ApisixReportsService } from './apisix-reports.service';
import { ApisixReportsController } from './apisix-reports.controller';
import { PatroniReport } from '../entities/patroni-report.entity';
import { PatroniReportsService } from './patroni-reports.service';
import { PatroniReportsController } from './patroni-reports.controller';
import { TransactionReport } from '../entities/transaction-report.entity';
import { TransactionReportsService } from './transaction-reports.service';
import { TransactionReportsController } from './transaction-reports.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Report, NemsmReport, ApisixReport, PatroniReport, TransactionReport])],
  providers: [ReportsService, NemsmReportsService, ApisixReportsService, PatroniReportsService, TransactionReportsService],
  controllers: [ReportsController, NemsmReportsController, ApisixReportsController, PatroniReportsController, TransactionReportsController],
  exports: [ReportsService, NemsmReportsService, ApisixReportsService, PatroniReportsService, TransactionReportsService],
})
export class ReportsModule {} 