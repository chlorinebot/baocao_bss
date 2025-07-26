import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './report.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
  ) {}

  async createReport(id_user: number, content: string): Promise<Report> {
    const report = this.reportRepository.create({ id_user, content });
    return this.reportRepository.save(report);
  }

  async getAllReports(): Promise<Report[]> {
    return this.reportRepository.find({ order: { created_at: 'DESC' } });
  }

  async getReportsByUserId(userId: number): Promise<Report[]> {
    return this.reportRepository.find({ 
      where: { id_user: userId },
      order: { created_at: 'DESC' } 
    });
  }
} 