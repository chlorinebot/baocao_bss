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
exports.ServersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const server_entity_1 = require("../entities/server.entity");
let ServersService = class ServersService {
    serverRepository;
    constructor(serverRepository) {
        this.serverRepository = serverRepository;
    }
    async onModuleInit() {
        await this.fixAutoIncrement();
    }
    async fixAutoIncrement() {
        try {
            const serverWithZeroId = await this.serverRepository.findOne({
                where: { id: 0 }
            });
            if (serverWithZeroId) {
                console.log('Found server with ID = 0, fixing auto increment...');
                await this.serverRepository.delete({ id: 0 });
                await this.serverRepository.query('ALTER TABLE nemsm AUTO_INCREMENT = 1');
                const newServer = this.serverRepository.create({
                    server_name: serverWithZeroId.server_name,
                    ip: serverWithZeroId.ip
                });
                await this.serverRepository.save(newServer);
                console.log('Auto increment fixed successfully!');
            }
            else {
                await this.serverRepository.query('ALTER TABLE nemsm AUTO_INCREMENT = 1');
            }
        }
        catch (error) {
            console.error('Error fixing auto increment:', error);
        }
    }
    async findAll() {
        try {
            return await this.serverRepository.find({
                order: { id: 'ASC' }
            });
        }
        catch (error) {
            throw new common_1.BadRequestException('Lỗi khi tải danh sách máy chủ');
        }
    }
    async findOne(id) {
        try {
            const server = await this.serverRepository.findOne({
                where: { id }
            });
            if (!server) {
                throw new common_1.NotFoundException(`Không tìm thấy máy chủ với ID ${id}`);
            }
            return server;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException('Lỗi khi tìm máy chủ');
        }
    }
    async create(createServerDto) {
        try {
            console.log('📥 Nhận request tạo server mới:', createServerDto);
            if (!createServerDto.server_name || !createServerDto.ip) {
                console.error('❌ Thiếu thông tin server_name hoặc ip');
                throw new common_1.BadRequestException('Tên máy chủ và địa chỉ IP là bắt buộc');
            }
            const existingServerByName = await this.serverRepository.findOne({
                where: { server_name: createServerDto.server_name }
            });
            if (existingServerByName) {
                console.error('❌ Tên máy chủ đã tồn tại:', createServerDto.server_name);
                throw new common_1.BadRequestException('Tên máy chủ đã tồn tại');
            }
            const existingServerByIP = await this.serverRepository.findOne({
                where: { ip: createServerDto.ip }
            });
            if (existingServerByIP) {
                console.error('❌ Địa chỉ IP đã tồn tại:', createServerDto.ip);
                throw new common_1.BadRequestException('Địa chỉ IP đã tồn tại');
            }
            if (!this.isValidIP(createServerDto.ip)) {
                console.error('❌ Địa chỉ IP không hợp lệ:', createServerDto.ip);
                throw new common_1.BadRequestException('Địa chỉ IP không hợp lệ');
            }
            await this.serverRepository.query('ALTER TABLE nemsm AUTO_INCREMENT = 1');
            const result = await this.serverRepository.query('INSERT INTO nemsm (server_name, ip) VALUES (?, ?)', [createServerDto.server_name, createServerDto.ip]);
            const insertId = result.insertId;
            console.log('✅ Server đã được tạo với ID:', insertId);
            const newServer = await this.serverRepository.findOne({
                where: { id: insertId }
            });
            if (!newServer) {
                throw new Error(`Không thể tìm thấy server vừa tạo với ID ${insertId}`);
            }
            console.log('✅ Thông tin đầy đủ của server vừa tạo:', newServer);
            return newServer;
        }
        catch (error) {
            console.error('❌ Lỗi khi tạo máy chủ mới:', error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Lỗi khi tạo máy chủ mới: ' + (error.message || 'Lỗi không xác định'));
        }
    }
    async update(id, updateServerDto) {
        try {
            const server = await this.findOne(id);
            if (updateServerDto.server_name && updateServerDto.server_name !== server.server_name) {
                const existingServerByName = await this.serverRepository.findOne({
                    where: { server_name: updateServerDto.server_name }
                });
                if (existingServerByName) {
                    throw new common_1.BadRequestException('Tên máy chủ đã tồn tại');
                }
            }
            if (updateServerDto.ip && updateServerDto.ip !== server.ip) {
                const existingServerByIP = await this.serverRepository.findOne({
                    where: { ip: updateServerDto.ip }
                });
                if (existingServerByIP) {
                    throw new common_1.BadRequestException('Địa chỉ IP đã tồn tại');
                }
                if (!this.isValidIP(updateServerDto.ip)) {
                    throw new common_1.BadRequestException('Địa chỉ IP không hợp lệ');
                }
            }
            Object.assign(server, updateServerDto);
            return await this.serverRepository.save(server);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Lỗi khi cập nhật máy chủ');
        }
    }
    async remove(id) {
        try {
            const server = await this.findOne(id);
            await this.serverRepository.remove(server);
            return {
                success: true,
                message: 'Xóa máy chủ thành công'
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException('Lỗi khi xóa máy chủ');
        }
    }
    async count() {
        try {
            return await this.serverRepository.count();
        }
        catch (error) {
            throw new common_1.BadRequestException('Lỗi khi đếm máy chủ');
        }
    }
    isValidIP(ip) {
        const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipRegex.test(ip);
    }
};
exports.ServersService = ServersService;
exports.ServersService = ServersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(server_entity_1.Server)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ServersService);
//# sourceMappingURL=servers.service.js.map