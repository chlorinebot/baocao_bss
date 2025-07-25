import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApisixReport } from '../entities/apisix-report.entity';

export interface CreateApisixReportDto {
  id_report_id: number;
  note_request?: string;
  note_upstream?: string;
}

@Injectable()
export class ApisixReportsService {
  constructor(
    @InjectRepository(ApisixReport)
    private readonly apisixReportRepository: Repository<ApisixReport>,
  ) {}

  async createApisixReport(data: CreateApisixReportDto): Promise<ApisixReport> {
    const apisixReport = new ApisixReport();
    apisixReport.id_report_id = data.id_report_id;
    apisixReport.note_request = data.note_request || '';
    apisixReport.note_upstream = data.note_upstream || '';
    
    return this.apisixReportRepository.save(apisixReport);
  }

  async getApisixReportsByReportId(reportId: number): Promise<ApisixReport[]> {
    return this.apisixReportRepository.find({
      where: { id_report_id: reportId },
      order: { id: 'ASC' }
    });
  }

  async getAllApisixReports(): Promise<ApisixReport[]> {
    return this.apisixReportRepository.find({
      relations: ['report'],
      order: { id: 'DESC' }
    });
  }
} 