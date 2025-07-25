import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatroniReport } from '../entities/patroni-report.entity';

export interface CreatePatroniReportDto {
  id_report_id: number;
  row_index: number;
  primary_node?: boolean;
  wal_replay_paused?: boolean;
  replicas_received_wal?: boolean;
  primary_wal_location?: boolean;
  replicas_replayed_wal?: boolean;
  notes?: string;
}

@Injectable()
export class PatroniReportsService {
  constructor(
    @InjectRepository(PatroniReport)
    private readonly patroniReportRepository: Repository<PatroniReport>,
  ) {}

  async createPatroniReport(data: CreatePatroniReportDto): Promise<PatroniReport> {
    const patroniReport = new PatroniReport();
    patroniReport.id_report_id = data.id_report_id;
    patroniReport.row_index = data.row_index;
    patroniReport.primary_node = data.primary_node ? 'true' : 'false';
    patroniReport.wal_replay_paused = data.wal_replay_paused ? 'true' : 'false';
    patroniReport.replicas_received_wal = data.replicas_received_wal ? 'true' : 'false';
    patroniReport.primary_wal_location = data.primary_wal_location ? 'true' : 'false';
    patroniReport.replicas_replayed_wal = data.replicas_replayed_wal ? 'true' : 'false';
    patroniReport.notes = data.notes || '';
    
    return this.patroniReportRepository.save(patroniReport);
  }

  async createMultiplePatroniReports(reports: CreatePatroniReportDto[]): Promise<PatroniReport[]> {
    const patroniReports = reports.map(data => {
      const patroniReport = new PatroniReport();
      patroniReport.id_report_id = data.id_report_id;
      patroniReport.row_index = data.row_index;
      patroniReport.primary_node = data.primary_node ? 'true' : 'false';
      patroniReport.wal_replay_paused = data.wal_replay_paused ? 'true' : 'false';
      patroniReport.replicas_received_wal = data.replicas_received_wal ? 'true' : 'false';
      patroniReport.primary_wal_location = data.primary_wal_location ? 'true' : 'false';
      patroniReport.replicas_replayed_wal = data.replicas_replayed_wal ? 'true' : 'false';
      patroniReport.notes = data.notes || '';
      return patroniReport;
    });
    
    return this.patroniReportRepository.save(patroniReports);
  }

  async getPatroniReportsByReportId(reportId: number): Promise<PatroniReport[]> {
    return this.patroniReportRepository.find({
      where: { id_report_id: reportId },
      order: { row_index: 'ASC' }
    });
  }

  async getAllPatroniReports(): Promise<PatroniReport[]> {
    return this.patroniReportRepository.find({
      relations: ['report'],
      order: { id: 'DESC' }
    });
  }
} 