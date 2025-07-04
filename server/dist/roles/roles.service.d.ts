import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
export declare class RolesService {
    private readonly roleRepository;
    constructor(roleRepository: Repository<Role>);
    findAll(): Promise<Role[]>;
    findOne(role_id: number): Promise<Role | null>;
    findByName(role_name: string): Promise<Role | null>;
    create(roleData: Partial<Role>): Promise<Role>;
    update(role_id: number, roleData: Partial<Role>): Promise<Role | null>;
    remove(role_id: number): Promise<void>;
}
