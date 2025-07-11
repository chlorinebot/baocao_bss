import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Report } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
  ) {}

  async createReport(createReportDto: CreateReportDto, userId: number): Promise<Report> {
    try {
      // Kiểm tra xem đã có báo cáo cho ngày hôm nay chưa
      const today = new Date().toISOString().split('T')[0];
      const existingReport = await this.reportRepository.findOne({
        where: {
          userId,
          date: today,
        },
      });

      if (existingReport) {
        throw new BadRequestException('Đã có báo cáo cho ngày hôm nay');
      }

      const report = this.reportRepository.create({
        ...createReportDto,
        userId,
        date: today,
        createdAt: new Date(),
      });

      return await this.reportRepository.save(report);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Không thể tạo báo cáo');
    }
  }

  async findAll(params: {
    userId: number;
    page: number;
    limit: number;
    startDate?: string;
    endDate?: string;
  }): Promise<{ data: Report[]; total: number; totalPages: number }> {
    const { userId, page, limit, startDate, endDate } = params;
    
    const whereCondition: any = { userId };
    
    if (startDate && endDate) {
      whereCondition.date = Between(startDate, endDate);
    } else if (startDate) {
      whereCondition.date = Between(startDate, new Date().toISOString().split('T')[0]);
    }

    const [data, total] = await this.reportRepository.findAndCount({
      where: whereCondition,
      order: { date: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number, userId: number): Promise<Report> {
    const report = await this.reportRepository.findOne({
      where: { id, userId },
    });

    if (!report) {
      throw new NotFoundException('Không tìm thấy báo cáo');
    }

    return report;
  }

  async remove(id: number, userId: number): Promise<void> {
    const report = await this.findOne(id, userId);
    await this.reportRepository.remove(report);
  }
} 