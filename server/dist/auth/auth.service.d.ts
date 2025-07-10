import { UsersService } from '../users/users.service';
import { AuthServiceResponse } from './auth.controller';
export declare class AuthService {
    private readonly usersService;
    constructor(usersService: UsersService);
    validateUser(username: string, password: string): Promise<AuthServiceResponse | null>;
}
