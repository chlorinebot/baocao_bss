import { AuthService } from './auth.service';
export interface LoginDto {
    username: string;
    password: string;
}
export interface AuthServiceResponse {
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
export interface LoginResponse {
    success: boolean;
    message?: string;
    token?: string;
    user?: {
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
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<LoginResponse>;
}
