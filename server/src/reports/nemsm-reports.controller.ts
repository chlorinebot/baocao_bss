import { Controller, Post, Get, Body, Param, ParseIntPipe } from '@nestjs/common';
import { NemsmReportsService, CreateNemsmReportDto } from './nemsm-reports.service';

interface CreateNemsmReportsRequestDto {
  reportId: number;
  nemsmData: {
    serverId: number;
    cpu: boolean;
    memory: boolean;
    disk: boolean;
    network: boolean;
    netstat: boolean;
    notes?: string;
  }[];
}

@Controller('nemsm-reports')
export class NemsmReportsController {
  constructor(private readonly nemsmReportsService: NemsmReportsService) {}

  @Post()
  async createNemsmReports(@Body() body: CreateNemsmReportsRequestDto) {
    try {
      const { reportId, nemsmData } = body;
      
      // Chuyển đổi dữ liệu từ frontend sang format cho database
      const nemsmReports: CreateNemsmReportDto[] = nemsmData.map(data => ({
        id_report_id: reportId,
        id_nemsm: data.serverId,
        cpu: data.cpu,
        memory: data.memory,
        disk_space_used: data.disk,
        network_traffic: data.network,
        netstat: data.netstat,
        notes: data.notes
      }));

      const savedReports = await this.nemsmReportsService.createMultipleNemsmReports(nemsmReports);
      
      return {
        success: true,
        message: 'Dữ liệu NEMSM đã được lưu thành công',
        data: savedReports
      };
    } catch (error) {
      console.error('Lỗi khi lưu dữ liệu NEMSM:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi lưu dữ liệu NEMSM',
        error: error.message
      };
    }
  }

  @Post('single')
  async createSingleNemsmReport(@Body() body: CreateNemsmReportDto) {
    try {
      const savedReport = await this.nemsmReportsService.createNemsmReport(body);
      
      return {
        success: true,
        message: 'Dữ liệu NEMSM đã được lưu thành công',
        data: savedReport
      };
    } catch (error) {
      console.error('Lỗi khi lưu dữ liệu NEMSM:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi lưu dữ liệu NEMSM',
        error: error.message
      };
    }
  }

  @Get()
  async getAllNemsmReports() {
    try {
      const reports = await this.nemsmReportsService.getAllNemsmReports();
      return {
        success: true,
        data: reports
      };
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu NEMSM reports:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi lấy dữ liệu NEMSM reports',
        error: error.message
      };
    }
  }

  @Get('by-report/:reportId')
  async getNemsmReportsByReportId(@Param('reportId', ParseIntPipe) reportId: number) {
    try {
      const reports = await this.nemsmReportsService.getNemsmReportsByReportId(reportId);
      return {
        success: true,
        data: reports
      };
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu NEMSM reports theo report ID:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi lấy dữ liệu NEMSM reports',
        error: error.message
      };
    }
  }
} 