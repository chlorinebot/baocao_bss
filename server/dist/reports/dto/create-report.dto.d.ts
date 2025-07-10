declare class CheckboxItemDto {
    id: string;
    label: string;
    checked: boolean;
    note?: string;
}
export declare class CreateReportDto {
    title: string;
    description: string;
    type: string;
    checkboxItems: CheckboxItemDto[];
    generalNote?: string;
    reportDate: string;
    status?: string;
}
export {};
