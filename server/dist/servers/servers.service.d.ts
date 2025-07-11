import { Repository } from 'typeorm';
import { Server } from '../entities/server.entity';
export declare class ServersService {
    private serversRepository;
    constructor(serversRepository: Repository<Server>);
    findAll(): Promise<Server[]>;
}
