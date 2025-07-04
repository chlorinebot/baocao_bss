import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
export declare class UsersService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    findAll(): Promise<User[]>;
    findOne(id: number): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
    create(userData: Partial<User>): Promise<User>;
    update(id: number, userData: Partial<User>): Promise<User | null>;
    remove(id: number): Promise<void>;
    count(): Promise<number>;
    verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
    hashPassword(password: string): Promise<string>;
    updatePassword(id: number, hashedPassword: string): Promise<void>;
}
