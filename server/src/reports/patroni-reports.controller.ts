import { Controller, Post, Get, Body, Param, ParseIntPipe } from '@nestjs/common';
import { PatroniReportsService, CreatePatroniReportDto } from './patroni-reports.service';

interface CreatePatroniReportsRequestDto {
  reportId: number;
  patroniData: {
    rowIndex: number;
    primary_node: boolean;
    wal_replay_paused: boolean;
    replicas_received_wal: boolean;
    primary_wal_location: boolean;
    replicas_replayed_wal: boolean;
    notes?: string;
  }[];
}

@Controller('patroni-reports')
export class PatroniReportsController {
  constructor(private readonly patroniReportsService: PatroniReportsService) {}

  @Post()
  async createPatroniReports(@Body() body: CreatePatroniReportsRequestDto) {
    try {
      const { reportId, patroniData } = body;
      
      // Chuyển đổi dữ liệu từ frontend sang format cho database
      const patroniReports: CreatePatroniReportDto[] = patroniData.map(data => ({
        id_report_id: reportId,
        row_index: data.rowIndex,
        primary_node: data.primary_node,
        wal_replay_paused: data.wal_replay_paused,
        replicas_received_wal: data.replicas_received_wal,
        primary_wal_location: data.primary_wal_location,
        replicas_replayed_wal: data.replicas_replayed_wal,
        notes: data.notes
      }));

      const savedReports = await this.patroniReportsService.createMultiplePatroniReports(patroniReports);
      
      return {
        success: true,
        message: 'Dữ liệu PostgreSQL Patroni đã được lưu thành công',
        data: savedReports
      };
    } catch (error) {
      console.error('Lỗi khi lưu dữ liệu PostgreSQL Patroni:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi lưu dữ liệu PostgreSQL Patroni',
        error: error.message
      };
    }
  }

  @Post('single')
  async createSinglePatroniReport(@Body() body: CreatePatroniReportDto) {
    try {
      const savedReport = await this.patroniReportsService.createPatroniReport(body);
      
      return {
        success: true,
        message: 'Dữ liệu PostgreSQL Patroni đã được lưu thành công',
        data: savedReport
      };
    } catch (error) {
      console.error('Lỗi khi lưu dữ liệu PostgreSQL Patroni:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi lưu dữ liệu PostgreSQL Patroni',
        error: error.message
      };
    }
  }

  @Get()
  async getAllPatroniReports() {
    try {
      const reports = await this.patroniReportsService.getAllPatroniReports();
      return {
        success: true,
        data: reports
      };
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu PostgreSQL Patroni reports:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi lấy dữ liệu PostgreSQL Patroni reports',
        error: error.message
      };
    }
  }

  @Get('by-report/:reportId')
  async getPatroniReportsByReportId(@Param('reportId', ParseIntPipe) reportId: number) {
    try {
      const reports = await this.patroniReportsService.getPatroniReportsByReportId(reportId);
      return {
        success: true,
        data: reports
      };
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu PostgreSQL Patroni reports theo report ID:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi lấy dữ liệu PostgreSQL Patroni reports',
        error: error.message
      };
    }
  }
} 