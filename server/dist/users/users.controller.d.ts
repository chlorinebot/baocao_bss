import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
interface LoginDto {
    username: string;
    password: string;
}
interface LoginResponse {
    access_token: string;
    user: {
        id: number;
        username: string;
        email: string;
        firstName: string;
        lastName: string;
        role_id: number;
        birthday?: string;
        createdAt: string;
        updatedAt: string;
    };
}
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User>;
    create(userData: Partial<User>): Promise<{
        message: string;
        user: User;
    }>;
    update(id: string, userData: Partial<User>): Promise<User>;
    updatePassword(id: string, body: {
        password: string;
        adminId: number;
        adminRoleId: number;
    }): Promise<{
        message: string;
    }>;
    private checkPasswordChangePermission;
    remove(id: string): Promise<{
        message: string;
    }>;
    count(): Promise<{
        count: number;
    }>;
    login(loginDto: LoginDto): Promise<LoginResponse>;
    testLogin(loginDto: LoginDto): Promise<any>;
    simpleLogin(loginDto: LoginDto): Promise<{
        success: boolean;
        user: {
            id: number;
            username: string;
            role_id: number;
        } | null;
        error?: undefined;
    } | {
        error: any;
        success?: undefined;
        user?: undefined;
    }>;
    resetPassword(body: {
        username: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
}
export {};
