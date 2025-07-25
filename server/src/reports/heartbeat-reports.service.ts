import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HeartbeatReport } from '../entities/heartbeat-report.entity';

export interface CreateHeartbeatReportDto {
  id_report_id: number;
  row_index: number;
  heartbeat_86?: boolean;
  heartbeat_87?: boolean;
  heartbeat_88?: boolean;
  notes?: string;
}

@Injectable()
export class HeartbeatReportsService {
  constructor(
    @InjectRepository(HeartbeatReport)
    private readonly heartbeatReportRepository: Repository<HeartbeatReport>,
  ) {}

  async createHeartbeatReport(data: CreateHeartbeatReportDto): Promise<HeartbeatReport> {
    const heartbeatReport = new HeartbeatReport();
    heartbeatReport.id_report_id = data.id_report_id;
    heartbeatReport.row_index = data.row_index;
    heartbeatReport.heartbeat_86 = data.heartbeat_86 ? 'true' : 'false';
    heartbeatReport.heartbeat_87 = data.heartbeat_87 ? 'true' : 'false';
    heartbeatReport.heartbeat_88 = data.heartbeat_88 ? 'true' : 'false';
    heartbeatReport.notes = data.notes || '';
    
    return this.heartbeatReportRepository.save(heartbeatReport);
  }

  async createMultipleHeartbeatReports(reports: CreateHeartbeatReportDto[]): Promise<HeartbeatReport[]> {
    const heartbeatReports = reports.map(data => {
      const heartbeatReport = new HeartbeatReport();
      heartbeatReport.id_report_id = data.id_report_id;
      heartbeatReport.row_index = data.row_index;
      heartbeatReport.heartbeat_86 = data.heartbeat_86 ? 'true' : 'false';
      heartbeatReport.heartbeat_87 = data.heartbeat_87 ? 'true' : 'false';
      heartbeatReport.heartbeat_88 = data.heartbeat_88 ? 'true' : 'false';
      heartbeatReport.notes = data.notes || '';
      return heartbeatReport;
    });
    
    return this.heartbeatReportRepository.save(heartbeatReports);
  }

  async getHeartbeatReportsByReportId(reportId: number): Promise<HeartbeatReport[]> {
    return this.heartbeatReportRepository.find({
      where: { id_report_id: reportId },
      order: { row_index: 'ASC' }
    });
  }

  async getAllHeartbeatReports(): Promise<HeartbeatReport[]> {
    return this.heartbeatReportRepository.find({
      relations: ['report'],
      order: { id: 'DESC' }
    });
  }
} 