import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async findAll(): Promise<Role[]> {
    return await this.roleRepository.find();
  }

  async findOne(role_id: number): Promise<Role | null> {
    return await this.roleRepository.findOne({ where: { role_id } });
  }

  async findByName(role_name: string): Promise<Role | null> {
    return await this.roleRepository.findOne({ where: { role_name } });
  }

  async create(roleData: Partial<Role>): Promise<Role> {
    const role = this.roleRepository.create(roleData);
    return await this.roleRepository.save(role);
  }

  async update(role_id: number, roleData: Partial<Role>): Promise<Role | null> {
    await this.roleRepository.update(role_id, roleData);
    return await this.findOne(role_id);
  }

  async remove(role_id: number): Promise<void> {
    await this.roleRepository.delete(role_id);
  }
} 