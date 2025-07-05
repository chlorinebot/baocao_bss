import { Repository } from 'typeorm';
import { WorkSchedule } from '../entities/work-schedule.entity';
import { User } from '../entities/user.entity';
export interface CreateWorkScheduleDto {
    employee_a: number;
    employee_b: number;
    employee_c: number;
    employee_d: number;
}
export interface UpdateWorkScheduleDto {
    employee_a?: number;
    employee_b?: number;
    employee_c?: number;
    employee_d?: number;
}
export declare class WorkScheduleService {
    private readonly workScheduleRepository;
    private readonly userRepository;
    constructor(workScheduleRepository: Repository<WorkSchedule>, userRepository: Repository<User>);
    findAll(): Promise<any[]>;
    findOne(id: number): Promise<WorkSchedule>;
    findByDate(date: string): Promise<WorkSchedule[]>;
    create(createWorkScheduleDto: CreateWorkScheduleDto): Promise<WorkSchedule>;
    update(id: number, updateWorkScheduleDto: UpdateWorkScheduleDto): Promise<WorkSchedule>;
    remove(id: number): Promise<void>;
    getAvailableEmployees(): Promise<User[]>;
    getScheduleStats(startDate: string, endDate: string): Promise<{
        totalSchedules: number;
        schedules: WorkSchedule[];
    }>;
}
