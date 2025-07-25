import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NemsmReport } from '../entities/nemsm-report.entity';

export interface CreateNemsmReportDto {
  id_report_id: number;
  id_nemsm: number;
  cpu?: boolean;
  memory?: boolean;
  disk_space_used?: boolean;
  network_traffic?: boolean;
  netstat?: boolean;
  notes?: string;
}

@Injectable()
export class NemsmReportsService {
  constructor(
    @InjectRepository(NemsmReport)
    private readonly nemsmReportRepository: Repository<NemsmReport>,
  ) {}

  async createNemsmReport(data: CreateNemsmReportDto): Promise<NemsmReport> {
    const nemsmReport = new NemsmReport();
    nemsmReport.id_report_id = data.id_report_id;
    nemsmReport.id_nemsm = data.id_nemsm;
    nemsmReport.cpu = data.cpu ? 'true' : 'false';
    nemsmReport.memory = data.memory ? 'true' : 'false';
    nemsmReport.disk_space_used = data.disk_space_used ? 'true' : 'false';
    nemsmReport.network_traffic = data.network_traffic ? 'true' : 'false';
    nemsmReport.netstat = data.netstat ? 'true' : 'false';
    nemsmReport.notes = data.notes || '';
    
    return this.nemsmReportRepository.save(nemsmReport);
  }

  async createMultipleNemsmReports(reports: CreateNemsmReportDto[]): Promise<NemsmReport[]> {
    const nemsmReports = reports.map(data => {
      const nemsmReport = new NemsmReport();
      nemsmReport.id_report_id = data.id_report_id;
      nemsmReport.id_nemsm = data.id_nemsm;
      nemsmReport.cpu = data.cpu ? 'true' : 'false';
      nemsmReport.memory = data.memory ? 'true' : 'false';
      nemsmReport.disk_space_used = data.disk_space_used ? 'true' : 'false';
      nemsmReport.network_traffic = data.network_traffic ? 'true' : 'false';
      nemsmReport.netstat = data.netstat ? 'true' : 'false';
      nemsmReport.notes = data.notes || '';
      return nemsmReport;
    });
    
    return this.nemsmReportRepository.save(nemsmReports);
  }

  async getNemsmReportsByReportId(reportId: number): Promise<NemsmReport[]> {
    return this.nemsmReportRepository.find({
      where: { id_report_id: reportId },
      relations: ['server'],
      order: { id: 'ASC' }
    });
  }

  async getAllNemsmReports(): Promise<NemsmReport[]> {
    return this.nemsmReportRepository.find({
      relations: ['report', 'server'],
      order: { id: 'DESC' }
    });
  }
} 