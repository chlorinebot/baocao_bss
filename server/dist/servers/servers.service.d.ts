import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Server } from '../entities/server.entity';
export interface CreateServerDto {
    server_name: string;
    ip: string;
}
export interface UpdateServerDto {
    server_name?: string;
    ip?: string;
}
export declare class ServersService implements OnModuleInit {
    private readonly serverRepository;
    constructor(serverRepository: Repository<Server>);
    onModuleInit(): Promise<void>;
    private fixAutoIncrement;
    findAll(): Promise<Server[]>;
    findOne(id: number): Promise<Server>;
    create(createServerDto: CreateServerDto): Promise<Server>;
    update(id: number, updateServerDto: UpdateServerDto): Promise<Server>;
    remove(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
    count(): Promise<number>;
    private isValidIP;
}
