import { ServersService } from './servers.service';
export declare class ServersController {
    private readonly serversService;
    constructor(serversService: ServersService);
    getAllServers(): Promise<import("../entities/server.entity").Server[]>;
}
