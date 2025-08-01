export declare class Report {
    id: number;
    id_user: number;
    content: string;
    shift_type: 'morning' | 'afternoon' | 'evening';
    shift_date: Date;
    created_at: Date;
}
