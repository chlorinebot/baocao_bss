import { DataSource } from 'typeorm';
export declare class MonthlySchedulesService {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    getAllMonthlySchedules(): Promise<any[]>;
    getMonthlySchedule(month: number, year: number): Promise<any>;
    createMonthlySchedule(month: number, year: number, createdBy: number): Promise<any>;
    generateAutoSchedule(month: number, year: number, createdBy: number, startingRole?: string): Promise<{
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
    updateMonthlySchedule(id: number, scheduleData: string, updatedBy: number): Promise<any>;
    deleteMonthlySchedule(id: number, deletedBy: number): Promise<{
        message: string;
    }>;
    getScheduleById(id: number): Promise<any>;
}
