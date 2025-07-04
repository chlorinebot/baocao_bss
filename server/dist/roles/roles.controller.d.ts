import { RolesService } from './roles.service';
import { Role } from '../entities/role.entity';
export declare class RolesController {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    findAll(): Promise<Role[]>;
    findOne(id: string): Promise<Role>;
    create(roleData: Partial<Role>): Promise<{
        message: string;
        role: Role;
    }>;
    initDefaultRoles(): Promise<{
        message: string;
    }>;
}
