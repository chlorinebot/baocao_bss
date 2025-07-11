import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateReportResponse, FindAllResponse, FindOneResponse } from './interfaces/report.interface';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  async createReport(
    @Body() createReportDto: CreateReportDto, 
    @Request() req
  ): Promise<CreateReportResponse> {
    const userId = req.user.userId;
    return this.reportsService.createReport(createReportDto, userId);
  }

  @Get()
  async getReports(
    @Query() query: any, 
    @Request() req
  ): Promise<FindAllResponse> {
    const userId = req.user.userId;
    const { page = 1, limit = 10, startDate, endDate } = query;
    
    return this.reportsService.findAll({
      userId,
      page: parseInt(page),
      limit: parseInt(limit),
      startDate,
      endDate,
    });
  }

  @Get(':id')
  async getReport(
    @Param('id') id: string, 
    @Request() req
  ): Promise<FindOneResponse> {
    const userId = req.user.userId;
    return this.reportsService.findOne(+id, userId);
  }
} 