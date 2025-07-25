import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionReport } from '../entities/transaction-report.entity';

export interface CreateTransactionReportDto {
  id_report_id: number;
  row_index: number;
  transaction_monitored?: boolean;
  notes?: string;
}

@Injectable()
export class TransactionReportsService {
  constructor(
    @InjectRepository(TransactionReport)
    private readonly transactionReportRepository: Repository<TransactionReport>,
  ) {}

  async createTransactionReport(data: CreateTransactionReportDto): Promise<TransactionReport> {
    const transactionReport = new TransactionReport();
    transactionReport.id_report_id = data.id_report_id;
    transactionReport.row_index = data.row_index;
    transactionReport.transaction_monitored = data.transaction_monitored ? 'true' : 'false';
    transactionReport.notes = data.notes || '';
    
    return this.transactionReportRepository.save(transactionReport);
  }

  async createMultipleTransactionReports(reports: CreateTransactionReportDto[]): Promise<TransactionReport[]> {
    const transactionReports = reports.map(data => {
      const transactionReport = new TransactionReport();
      transactionReport.id_report_id = data.id_report_id;
      transactionReport.row_index = data.row_index;
      transactionReport.transaction_monitored = data.transaction_monitored ? 'true' : 'false';
      transactionReport.notes = data.notes || '';
      return transactionReport;
    });
    
    return this.transactionReportRepository.save(transactionReports);
  }

  async getTransactionReportsByReportId(reportId: number): Promise<TransactionReport[]> {
    return this.transactionReportRepository.find({
      where: { id_report_id: reportId },
      order: { row_index: 'ASC' }
    });
  }

  async getAllTransactionReports(): Promise<TransactionReport[]> {
    return this.transactionReportRepository.find({
      relations: ['report'],
      order: { id: 'DESC' }
    });
  }
} 