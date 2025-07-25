import { Controller, Post, Get, Body, Param, ParseIntPipe } from '@nestjs/common';
import { HeartbeatReportsService, CreateHeartbeatReportDto } from './heartbeat-reports.service';

interface CreateHeartbeatReportsRequestDto {
  reportId: number;
  heartbeatData: {
    rowIndex: number;
    heartbeat_86: boolean;
    heartbeat_87: boolean;
    heartbeat_88: boolean;
    notes?: string;
  }[];
}

@Controller('heartbeat-reports')
export class HeartbeatReportsController {
  constructor(private readonly heartbeatReportsService: HeartbeatReportsService) {}

  @Post()
  async createHeartbeatReports(@Body() body: CreateHeartbeatReportsRequestDto) {
    try {
      const { reportId, heartbeatData } = body;
      
      // Chuyển đổi dữ liệu từ frontend sang format cho database
      const heartbeatReports: CreateHeartbeatReportDto[] = heartbeatData.map(data => ({
        id_report_id: reportId,
        row_index: data.rowIndex,
        heartbeat_86: data.heartbeat_86,
        heartbeat_87: data.heartbeat_87,
        heartbeat_88: data.heartbeat_88,
        notes: data.notes
      }));

      const savedReports = await this.heartbeatReportsService.createMultipleHeartbeatReports(heartbeatReports);
      
      return {
        success: true,
        message: 'Dữ liệu PostgreHeartbeat đã được lưu thành công',
        data: savedReports
      };
    } catch (error) {
      console.error('Lỗi khi lưu dữ liệu PostgreHeartbeat:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi lưu dữ liệu PostgreHeartbeat',
        error: error.message
      };
    }
  }

  @Post('single')
  async createSingleHeartbeatReport(@Body() body: CreateHeartbeatReportDto) {
    try {
      const savedReport = await this.heartbeatReportsService.createHeartbeatReport(body);
      
      return {
        success: true,
        message: 'Dữ liệu PostgreHeartbeat đã được lưu thành công',
        data: savedReport
      };
    } catch (error) {
      console.error('Lỗi khi lưu dữ liệu PostgreHeartbeat:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi lưu dữ liệu PostgreHeartbeat',
        error: error.message
      };
    }
  }

  @Get()
  async getAllHeartbeatReports() {
    try {
      const reports = await this.heartbeatReportsService.getAllHeartbeatReports();
      return {
        success: true,
        data: reports
      };
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu PostgreHeartbeat reports:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi lấy dữ liệu PostgreHeartbeat reports',
        error: error.message
      };
    }
  }

  @Get('by-report/:reportId')
  async getHeartbeatReportsByReportId(@Param('reportId', ParseIntPipe) reportId: number) {
    try {
      const reports = await this.heartbeatReportsService.getHeartbeatReportsByReportId(reportId);
      return {
        success: true,
        data: reports
      };
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu PostgreHeartbeat reports theo report ID:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi lấy dữ liệu PostgreHeartbeat reports',
        error: error.message
      };
    }
  }
} 