import { User } from './user.entity';
export declare class Report {
    id: number;
    title: string;
    description: string;
    type: string;
    checkboxItems: {
        id: string;
        label: string;
        checked: boolean;
        note?: string;
    }[];
    generalNote: string | null;
    status: string;
    createdBy: number;
    approvedBy: number;
    approvedAt: Date;
    reportDate: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    creator: User;
    approver: User;
}
