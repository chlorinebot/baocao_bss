"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const role_entity_1 = require("../entities/role.entity");
let RolesService = class RolesService {
    roleRepository;
    constructor(roleRepository) {
        this.roleRepository = roleRepository;
    }
    async findAll() {
        return await this.roleRepository.find();
    }
    async findOne(role_id) {
        return await this.roleRepository.findOne({ where: { role_id } });
    }
    async findByName(role_name) {
        return await this.roleRepository.findOne({ where: { role_name } });
    }
    async createDefaultRoles() {
        const adminRole = await this.findOne(1);
        if (!adminRole) {
            await this.roleRepository.save({
                role_id: 1,
                role_name: 'admin',
                description: 'Người quản trị hệ thống với đầy đủ quyền hạn'
            });
        }
        const userRole = await this.findOne(2);
        if (!userRole) {
            await this.roleRepository.save({
                role_id: 2,
                role_name: 'user',
                description: 'Người dùng thông thường với quyền hạn bình thường'
            });
        }
    }
    async create(roleData) {
        const role = this.roleRepository.create(roleData);
        return await this.roleRepository.save(role);
    }
    async update(role_id, roleData) {
        await this.roleRepository.update(role_id, roleData);
        return await this.findOne(role_id);
    }
    async remove(role_id) {
        await this.roleRepository.delete(role_id);
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RolesService);
//# sourceMappingURL=roles.service.js.map