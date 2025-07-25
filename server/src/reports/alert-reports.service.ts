import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlertReport } from '../entities/alert-report.entity';

export interface CreateAlertReportDto {
  id_report_id: number;
  note_alert_1?: string;
  note_alert_2?: string;
}

@Injectable()
export class AlertReportsService {
  constructor(
    @InjectRepository(AlertReport)
    private readonly alertReportRepository: Repository<AlertReport>,
  ) {}

  async createAlertReport(data: CreateAlertReportDto): Promise<AlertReport> {
    const alertReport = new AlertReport();
    alertReport.id_report_id = data.id_report_id;
    alertReport.note_alert_1 = data.note_alert_1 || '';
    alertReport.note_alert_2 = data.note_alert_2 || '';
    
    return this.alertReportRepository.save(alertReport);
  }

  async getAlertReportsByReportId(reportId: number): Promise<AlertReport[]> {
    return this.alertReportRepository.find({
      where: { id_report_id: reportId },
      order: { id: 'ASC' }
    });
  }

  async getAllAlertReports(): Promise<AlertReport[]> {
    return this.alertReportRepository.find({
      relations: ['report'],
      order: { id: 'DESC' }
    });
  }
} 