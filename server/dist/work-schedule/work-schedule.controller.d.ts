import { WorkScheduleService, CreateWorkScheduleDto, UpdateWorkScheduleDto } from './work-schedule.service';
export declare class WorkScheduleController {
    private readonly workScheduleService;
    constructor(workScheduleService: WorkScheduleService);
    findAll(): Promise<{
        success: boolean;
        message: string;
        data: any[];
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    findOne(id: number): Promise<{
        success: boolean;
        message: string;
        data: import("../entities/work-schedule.entity").WorkSchedule;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    findByDate(date: string): Promise<{
        success: boolean;
        message: string;
        data: import("../entities/work-schedule.entity").WorkSchedule[];
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    getAvailableEmployees(): Promise<{
        success: boolean;
        message: string;
        data: import("../entities/user.entity").User[];
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    create(createWorkScheduleDto: CreateWorkScheduleDto): Promise<{
        success: boolean;
        message: string;
        data: import("../entities/work-schedule.entity").WorkSchedule;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    update(id: number, updateWorkScheduleDto: UpdateWorkScheduleDto): Promise<{
        success: boolean;
        message: string;
        data: import("../entities/work-schedule.entity").WorkSchedule;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    remove(id: number): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
    }>;
    getScheduleStats(startDate: string, endDate: string): Promise<{
        success: boolean;
        message: string;
        data: {
            totalSchedules: number;
            schedules: import("../entities/work-schedule.entity").WorkSchedule[];
        };
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
}
