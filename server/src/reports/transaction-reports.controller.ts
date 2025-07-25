import { Controller, Post, Get, Body, Param, ParseIntPipe } from '@nestjs/common';
import { TransactionReportsService, CreateTransactionReportDto } from './transaction-reports.service';

interface CreateTransactionReportsRequestDto {
  reportId: number;
  transactionData: {
    rowIndex: number;
    transaction_monitored: boolean;
    notes?: string;
  }[];
}

@Controller('transaction-reports')
export class TransactionReportsController {
  constructor(private readonly transactionReportsService: TransactionReportsService) {}

  @Post()
  async createTransactionReports(@Body() body: CreateTransactionReportsRequestDto) {
    try {
      const { reportId, transactionData } = body;
      
      // Chuyển đổi dữ liệu từ frontend sang format cho database
      const transactionReports: CreateTransactionReportDto[] = transactionData.map(data => ({
        id_report_id: reportId,
        row_index: data.rowIndex,
        transaction_monitored: data.transaction_monitored,
        notes: data.notes
      }));

      const savedReports = await this.transactionReportsService.createMultipleTransactionReports(transactionReports);
      
      return {
        success: true,
        message: 'Dữ liệu Database Transactions đã được lưu thành công',
        data: savedReports
      };
    } catch (error) {
      console.error('Lỗi khi lưu dữ liệu Database Transactions:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi lưu dữ liệu Database Transactions',
        error: error.message
      };
    }
  }

  @Post('single')
  async createSingleTransactionReport(@Body() body: CreateTransactionReportDto) {
    try {
      const savedReport = await this.transactionReportsService.createTransactionReport(body);
      
      return {
        success: true,
        message: 'Dữ liệu Database Transactions đã được lưu thành công',
        data: savedReport
      };
    } catch (error) {
      console.error('Lỗi khi lưu dữ liệu Database Transactions:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi lưu dữ liệu Database Transactions',
        error: error.message
      };
    }
  }

  @Get()
  async getAllTransactionReports() {
    try {
      const reports = await this.transactionReportsService.getAllTransactionReports();
      return {
        success: true,
        data: reports
      };
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu Database Transactions reports:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi lấy dữ liệu Database Transactions reports',
        error: error.message
      };
    }
  }

  @Get('by-report/:reportId')
  async getTransactionReportsByReportId(@Param('reportId', ParseIntPipe) reportId: number) {
    try {
      const reports = await this.transactionReportsService.getTransactionReportsByReportId(reportId);
      return {
        success: true,
        data: reports
      };
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu Database Transactions reports theo report ID:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi lấy dữ liệu Database Transactions reports',
        error: error.message
      };
    }
  }
} 