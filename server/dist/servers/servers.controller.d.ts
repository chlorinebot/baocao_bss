import { ServersService, CreateServerDto, UpdateServerDto } from './servers.service';
import { Server } from '../entities/server.entity';
export declare class ServersController {
    private readonly serversService;
    private readonly logger;
    constructor(serversService: ServersService);
    findAll(): Promise<Server[]>;
    count(): Promise<{
        count: number;
    }>;
    findOne(id: number): Promise<Server>;
    create(createServerDto: CreateServerDto): Promise<Server>;
    update(id: number, updateServerDto: UpdateServerDto): Promise<Server>;
    remove(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
