import { Role } from './role.entity';
export declare class User {
    id: number;
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    birthday: Date;
    isActive: boolean;
    role_id: number;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
}
