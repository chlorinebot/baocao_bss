import { Controller, Post, Get, Body, Param, ParseIntPipe } from '@nestjs/common';
import { AlertReportsService, CreateAlertReportDto } from './alert-reports.service';

interface CreateAlertReportsRequestDto {
  reportId: number;
  alertData: {
    note_alert_1?: string;
    note_alert_2?: string;
  };
}

@Controller('alert-reports')
export class AlertReportsController {
  constructor(private readonly alertReportsService: AlertReportsService) {}

  @Post()
  async createAlertReport(@Body() body: CreateAlertReportsRequestDto) {
    try {
      const { reportId, alertData } = body;
      
      // Chuyển đổi dữ liệu từ frontend sang format cho database
      const alertReport: CreateAlertReportDto = {
        id_report_id: reportId,
        note_alert_1: alertData.note_alert_1,
        note_alert_2: alertData.note_alert_2
      };

      const savedReport = await this.alertReportsService.createAlertReport(alertReport);
      
      return {
        success: true,
        message: 'Dữ liệu Cảnh báo đã được lưu thành công',
        data: savedReport
      };
    } catch (error) {
      console.error('Lỗi khi lưu dữ liệu Cảnh báo:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi lưu dữ liệu Cảnh báo',
        error: error.message
      };
    }
  }

  @Post('single')
  async createSingleAlertReport(@Body() body: CreateAlertReportDto) {
    try {
      const savedReport = await this.alertReportsService.createAlertReport(body);
      
      return {
        success: true,
        message: 'Dữ liệu Cảnh báo đã được lưu thành công',
        data: savedReport
      };
    } catch (error) {
      console.error('Lỗi khi lưu dữ liệu Cảnh báo:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi lưu dữ liệu Cảnh báo',
        error: error.message
      };
    }
  }

  @Get()
  async getAllAlertReports() {
    try {
      const reports = await this.alertReportsService.getAllAlertReports();
      return {
        success: true,
        data: reports
      };
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu Cảnh báo reports:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi lấy dữ liệu Cảnh báo reports',
        error: error.message
      };
    }
  }

  @Get('by-report/:reportId')
  async getAlertReportsByReportId(@Param('reportId', ParseIntPipe) reportId: number) {
    try {
      const reports = await this.alertReportsService.getAlertReportsByReportId(reportId);
      return {
        success: true,
        data: reports
      };
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu Cảnh báo reports theo report ID:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi lấy dữ liệu Cảnh báo reports',
        error: error.message
      };
    }
  }
} 