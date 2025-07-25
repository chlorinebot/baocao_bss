import { Controller, Post, Get, Body, Req } from '@nestjs/common';
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
  async getAllReports() {
    return this.reportsService.getAllReports();
  }
} 