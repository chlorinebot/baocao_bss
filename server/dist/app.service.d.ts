import { OnModuleInit } from '@nestjs/common';
import { RolesService } from './roles/roles.service';
export declare class AppService implements OnModuleInit {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    onModuleInit(): Promise<void>;
    getHello(): string;
}
