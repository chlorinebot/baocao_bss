import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { CreateReportDto } from './dto/create-report.dto';
import { PatroniReport } from '../entities/patroni-report.entity';
import { HeartbeatReport } from '../entities/heartbeat-report.entity';
import { DatabaseReport } from '../entities/database-report.entity';
import { WarningReport } from '../entities/warning-report.entity';
import { NemsmReport } from '../entities/nemsm-report.entity';
import { Report } from '../entities/report.entity';
import { 
  ReportResults, 
  CreateReportResponse, 
  FindAllResponse, 
  FindOneResponse 
} from './interfaces/report.interface';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(PatroniReport)
    private patroniReportRepository: Repository<PatroniReport>,
    @InjectRepository(HeartbeatReport)
    private heartbeatReportRepository: Repository<HeartbeatReport>,
    @InjectRepository(DatabaseReport)
    private databaseReportRepository: Repository<DatabaseReport>,
    @InjectRepository(WarningReport)
    private warningReportRepository: Repository<WarningReport>,
    @InjectRepository(NemsmReport)
    private nemsmReportRepository: Repository<NemsmReport>,
  ) {}

  async createReport(createReportDto: CreateReportDto, userId: number): Promise<CreateReportResponse> {
    try {
      const results: ReportResults = {
        nemsmReports: [],
        patroniReports: [],
        databaseReports: [],
        heartbeatReports: [],
        warningReports: []
      };

      // 1. Lưu Node Exporter (NEMSM) Reports
      for (const [index, nodeData] of createReportDto.nodeExporter.entries()) {
        if (this.hasNodeExporterData(nodeData)) {
          const nemsmReport = this.nemsmReportRepository.create({
            ID_NEmSM: index + 1,
            CPU: nodeData.cpu ? 'checked' : null,
            Memory: nodeData.memory ? 'checked' : null,
            Disk_space_user: nodeData.disk ? 'checked' : null,
            Network_traffic: nodeData.network ? 'checked' : null,
            Netstat: nodeData.netstat ? 'checked' : null,
            Note: nodeData.note?.trim() || null,
            by_ID_user: userId
          } as DeepPartial<NemsmReport>);
          
          const saved = await this.nemsmReportRepository.save(nemsmReport);
          results.nemsmReports.push(saved);
        }
      }

      // 2. Lưu Patroni Reports
      for (const [index, patroniData] of createReportDto.patroni.entries()) {
        if (this.hasPatroniData(patroniData)) {
          const patroniReport = this.patroniReportRepository.create({
            PatroniLeader: patroniData.primaryNode ? 'checked' : null,
            Patroni_Primary_Node_10_2_45_86: patroniData.primaryNode ? 'checked' : null,
            WAL_Replay_Paused: patroniData.walReplayPaused ? 'checked' : null,
            Replicas_Received_WAL_Location: patroniData.replicasReceivedWal ? 'checked' : null,
            Primary_WAL_Location: patroniData.primaryWalLocation ? 'checked' : null,
            Replicas_Replayed_WAL_Location: patroniData.replicasReplayedWal ? 'checked' : null,
            Note: patroniData.note?.trim() || null,
            by_ID_user: userId
          } as DeepPartial<PatroniReport>);
          
          const saved = await this.patroniReportRepository.save(patroniReport);
          results.patroniReports.push(saved);
        }
      }

      // 3. Lưu Database Transaction Reports
      for (const [index, transactionData] of createReportDto.transactions.entries()) {
        if (this.hasTransactionData(transactionData)) {
          const databaseReport = this.databaseReportRepository.create({
            Transactions_giam_sat: transactionData.monitored ? 'checked' : null,
            Note: transactionData.note?.trim() || null,
            by_ID_user: userId
          } as DeepPartial<DatabaseReport>);
          
          const saved = await this.databaseReportRepository.save(databaseReport);
          results.databaseReports.push(saved);
        }
      }

      // 4. Lưu Heartbeat Reports
      for (const [index, heartbeatData] of createReportDto.heartbeat.entries()) {
        if (this.hasHeartbeatData(heartbeatData)) {
          const heartbeatReport = this.heartbeatReportRepository.create({
            Post_heartbeat_10_2_45_86: heartbeatData.heartbeat86 ? 'checked' : null,
            Post_heartbeat_10_2_45_87: heartbeatData.heartbeat87 ? 'checked' : null,
            Post_heartbeat_10_2_45_88: heartbeatData.heartbeat88 ? 'checked' : null,
            Note: heartbeatData.note?.trim() || null,
            by_ID_user: userId
          } as DeepPartial<HeartbeatReport>);
          
          const saved = await this.heartbeatReportRepository.save(heartbeatReport);
          results.heartbeatReports.push(saved);
        }
      }

      // 5. Lưu Warning Reports
      if (this.hasWarningData(createReportDto.alerts)) {
        const warningReport = this.warningReportRepository.create({
          Warning_Critical: this.formatAlertTypes(createReportDto.alerts),
          info_backup_database: createReportDto.alerts.infoBackup ? 'checked' : null,
          Note: this.formatAlertNotes(createReportDto.alerts),
          by_ID_user: userId
        } as DeepPartial<WarningReport>);
        
        const saved = await this.warningReportRepository.save(warningReport);
        results.warningReports.push(saved);
      }

      // 6. Tạo báo cáo tổng hợp trong bảng reports
      const report = this.reportRepository.create({
        by_ID_user: userId,
        nemsm_report_id: results.nemsmReports[0]?.ID || null,
        patroni_report_id: results.patroniReports[0]?.ID || null,
        database_report_id: results.databaseReports[0]?.ID || null,
        heartbeat_report_id: results.heartbeatReports[0]?.ID || null,
        warning_report_id: results.warningReports[0]?.ID || null
      } as DeepPartial<Report>);

      const savedReport = await this.reportRepository.save(report);

      return {
        success: true,
        message: 'Báo cáo đã được lưu thành công',
        data: {
          report: savedReport,
          details: results
        }
      };

    } catch (error) {
      console.error('Lỗi khi tạo báo cáo:', error);
      throw new BadRequestException('Không thể lưu báo cáo: ' + error.message);
    }
  }

  private hasNodeExporterData(data: any): boolean {
    return Boolean(
      data.cpu || data.memory || data.disk || 
      data.network || data.netstat || data.note?.trim()
    );
  }

  private hasPatroniData(data: any): boolean {
    return Boolean(
      data.primaryNode || data.walReplayPaused || 
      data.replicasReceivedWal || data.primaryWalLocation || 
      data.replicasReplayedWal || data.note?.trim()
    );
  }

  private hasTransactionData(data: any): boolean {
    return Boolean(data.monitored || data.note?.trim());
  }

  private hasHeartbeatData(data: any): boolean {
    return Boolean(
      data.heartbeat86 || data.heartbeat87 || 
      data.heartbeat88 || data.note?.trim()
    );
  }

  private hasWarningData(data: any): boolean {
    return Boolean(
      data.warning || data.critical || data.info || 
      data.infoBackup || data.warningDisk || data.other || 
      data.note1?.trim() || data.note2?.trim()
    );
  }

  private formatAlertTypes(alerts: any): string {
    const types: string[] = [];
    if (alerts.warning) types.push('Warning');
    if (alerts.critical) types.push('Critical');
    if (alerts.info) types.push('Info');
    if (alerts.warningDisk) types.push('Warning Disk');
    if (alerts.other) types.push('Other');
    return types.length > 0 ? types.join(', ') : '';
  }

  private formatAlertNotes(alerts: any): string {
    const notes: string[] = [];
    if (alerts.note1?.trim()) notes.push(alerts.note1.trim());
    if (alerts.note2?.trim()) notes.push(alerts.note2.trim());
    return notes.length > 0 ? notes.join(' | ') : '';
  }

  async findAll(options: any = {}): Promise<FindAllResponse> {
    const { userId, page = 1, limit = 10, startDate, endDate } = options;
    
    try {
      const queryBuilder = this.reportRepository.createQueryBuilder('report')
        .leftJoinAndSelect('report.nemsmReport', 'nemsmReport')
        .leftJoinAndSelect('report.patroniReport', 'patroniReport')
        .leftJoinAndSelect('report.databaseReport', 'databaseReport')
        .leftJoinAndSelect('report.heartbeatReport', 'heartbeatReport')
        .leftJoinAndSelect('report.warningReport', 'warningReport')
        .where('report.by_ID_user = :userId', { userId })
        .orderBy('report.created_at', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

      if (startDate) {
        queryBuilder.andWhere('report.created_at >= :startDate', { startDate });
      }

      if (endDate) {
        queryBuilder.andWhere('report.created_at <= :endDate', { endDate });
      }

      const [reports, total] = await queryBuilder.getManyAndCount();

      return {
        success: true,
        data: {
          reports,
          pagination: {
            page,
            limit,
            total
          }
        }
      };

    } catch (error) {
      console.error('Lỗi khi lấy danh sách báo cáo:', error);
      throw new BadRequestException('Không thể lấy danh sách báo cáo');
    }
  }

  async findOne(id: number, userId: number): Promise<FindOneResponse> {
    try {
      const report = await this.reportRepository.findOne({
        where: { ID: id, by_ID_user: userId },
        relations: [
          'nemsmReport',
          'patroniReport', 
          'databaseReport',
          'heartbeatReport',
          'warningReport'
        ]
      });

      if (!report) {
        throw new BadRequestException('Không tìm thấy báo cáo');
      }

      return {
        success: true,
        data: report
      };
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết báo cáo:', error);
      throw new BadRequestException('Không thể lấy chi tiết báo cáo');
    }
  }
} 