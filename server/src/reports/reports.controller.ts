import { Controller, Post, Get, Body, Req, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  async createReport(@Body() body: { id_user: number; content: string }) {
    // Trong thực tế nên lấy id_user từ JWT, ở đây lấy từ body cho đơn giản
    return this.reportsService.createReport(body.id_user, body.content);
  }

  @Get()
  async getAllReports(@Query('user_id') userId?: string) {
    if (userId) {
      const userIdNumber = parseInt(userId, 10);
      if (isNaN(userIdNumber)) {
        return { error: 'Invalid user_id parameter' };
      }
      return this.reportsService.getReportsByUserId(userIdNumber);
    }
    return this.reportsService.getAllReports();
  }
} 