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
    getEmployeeRoles(): Promise<{
        success: boolean;
        message: string;
        data: any;
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
    getUserRole(userId: number): Promise<{
        success: boolean;
        message: string;
        data: {
            role: string;
            scheduleId: number | null;
        };
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    getUserCurrentShift(userId: number): Promise<{
        success: boolean;
        message: string;
        data: {
            role: string;
            shift: string | null;
            shiftTime: string | null;
            scheduleId: number | null;
        };
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    clearAllWorkSchedules(): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
    }>;
    debugCheckDatabase(): Promise<{
        success: boolean;
        data: {
            today: string;
            totalSchedules: number;
            todaySchedules: number;
            allSchedules: any[];
            todayScheduleDetail: import("../entities/work-schedule.entity").WorkSchedule[];
        };
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    createYesterdaySchedule(): Promise<{
        success: boolean;
        message: string;
        data: import("../entities/work-schedule.entity").WorkSchedule;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
        data?: undefined;
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
}
