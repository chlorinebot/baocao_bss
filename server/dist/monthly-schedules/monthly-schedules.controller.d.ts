import { MonthlySchedulesService } from './monthly-schedules.service';
export declare class MonthlySchedulesController {
    private readonly monthlySchedulesService;
    constructor(monthlySchedulesService: MonthlySchedulesService);
    getAllMonthlySchedules(): Promise<{
        success: boolean;
        data: any[];
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    getMonthlySchedule(year: number, month: number): Promise<{
        success: boolean;
        data: any;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    createMonthlySchedule(createData: {
        month: number;
        year: number;
        created_by: number;
    }): Promise<{
        success: boolean;
        data: any;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    generateAutoSchedule(generateData: {
        month: number;
        year: number;
        created_by: number;
        starting_role?: string;
    }): Promise<{
        success: boolean;
        message: any;
        data: any;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
        data?: undefined;
    }>;
    updateMonthlySchedule(id: number, updateData: {
        schedule_data: any[];
        updated_by?: number;
    }): Promise<{
        success: boolean;
        data: any;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    deleteMonthlySchedule(id: number): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
    }>;
    createTestData(): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
    }>;
    clearAllMonthlySchedules(): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
    }>;
}
