import { User } from './user.entity';
export declare class WorkSchedule {
    id: number;
    employee_a: number;
    employee_b: number;
    employee_c: number;
    employee_d: number;
    active: boolean;
    created_date: Date;
    activation_date: Date;
    employeeA: User;
    employeeB: User;
    employeeC: User;
    employeeD: User;
}
