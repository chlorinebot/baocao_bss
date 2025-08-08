import { Repository } from 'typeorm';
import { Report } from './report.entity';
import { WorkScheduleService } from '../work-schedule/work-schedule.service';
export declare class ReportsService {
    private readonly reportRepository;
    private readonly workScheduleService;
    constructor(reportRepository: Repository<Report>, workScheduleService: WorkScheduleService);
    canCreateReport(userId: number): Promise<{
        canCreate: boolean;
        reason?: string;
        currentShift?: string;
        shiftTime?: string;
        isWorkingTime?: boolean;
    }>;
    private translateShiftType;
    createReport(id_user: number, content: string): Promise<Report>;
    getAllReports(): Promise<Report[]>;
    getReportsByUserId(userId: number): Promise<Report[]>;
    getReportsByShift(shiftType: 'morning' | 'afternoon' | 'evening', date?: Date): Promise<Report[]>;
}
