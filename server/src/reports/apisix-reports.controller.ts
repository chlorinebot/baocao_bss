import { Controller, Post, Get, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApisixReportsService, CreateApisixReportDto } from './apisix-reports.service';

interface CreateApisixReportsRequestDto {
  reportId: number;
  apisixData: {
    note_request?: string;
    note_upstream?: string;
  };
}

@Controller('apisix-reports')
export class ApisixReportsController {
  constructor(private readonly apisixReportsService: ApisixReportsService) {}

  @Post()
  async createApisixReport(@Body() body: CreateApisixReportsRequestDto) {
    try {
      const { reportId, apisixData } = body;
      
      // Chuyển đổi dữ liệu từ frontend sang format cho database
      const apisixReport: CreateApisixReportDto = {
        id_report_id: reportId,
        note_request: apisixData.note_request,
        note_upstream: apisixData.note_upstream
      };

      const savedReport = await this.apisixReportsService.createApisixReport(apisixReport);
      
      return {
        success: true,
        message: 'Dữ liệu Apache APISIX đã được lưu thành công',
        data: savedReport
      };
    } catch (error) {
      console.error('Lỗi khi lưu dữ liệu Apache APISIX:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi lưu dữ liệu Apache APISIX',
        error: error.message
      };
    }
  }

  @Post('single')
  async createSingleApisixReport(@Body() body: CreateApisixReportDto) {
    try {
      const savedReport = await this.apisixReportsService.createApisixReport(body);
      
      return {
        success: true,
        message: 'Dữ liệu Apache APISIX đã được lưu thành công',
        data: savedReport
      };
    } catch (error) {
      console.error('Lỗi khi lưu dữ liệu Apache APISIX:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi lưu dữ liệu Apache APISIX',
        error: error.message
      };
    }
  }

  @Get()
  async getAllApisixReports() {
    try {
      const reports = await this.apisixReportsService.getAllApisixReports();
      return {
        success: true,
        data: reports
      };
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu Apache APISIX reports:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi lấy dữ liệu Apache APISIX reports',
        error: error.message
      };
    }
  }

  @Get('by-report/:reportId')
  async getApisixReportsByReportId(@Param('reportId', ParseIntPipe) reportId: number) {
    try {
      const reports = await this.apisixReportsService.getApisixReportsByReportId(reportId);
      return {
        success: true,
        data: reports
      };
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu Apache APISIX reports theo report ID:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi lấy dữ liệu Apache APISIX reports',
        error: error.message
      };
    }
  }
} 