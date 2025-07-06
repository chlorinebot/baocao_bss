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
var ServersController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServersController = void 0;
const common_1 = require("@nestjs/common");
const servers_service_1 = require("./servers.service");
let ServersController = ServersController_1 = class ServersController {
    serversService;
    logger = new common_1.Logger(ServersController_1.name);
    constructor(serversService) {
        this.serversService = serversService;
    }
    async findAll() {
        this.logger.log('🔄 Getting all servers...');
        return await this.serversService.findAll();
    }
    async count() {
        const count = await this.serversService.count();
        return { count };
    }
    async findOne(id) {
        this.logger.log(`🔍 Getting server with ID: ${id}`);
        return await this.serversService.findOne(id);
    }
    async create(createServerDto) {
        this.logger.log(`📝 Creating new server: ${JSON.stringify(createServerDto)}`);
        try {
            const result = await this.serversService.create(createServerDto);
            this.logger.log(`✅ Server created successfully with ID: ${result.id}`);
            if (result.id === undefined || result.id === null) {
                this.logger.error('❌ Server created but ID is undefined or null');
                throw new Error('Server created but ID is undefined or null');
            }
            if (typeof result.id !== 'number' || result.id === 0) {
                this.logger.error(`❌ Invalid server ID: ${result.id}`);
                const servers = await this.serversService.findAll();
                const createdServer = servers.find(s => s.server_name === createServerDto.server_name &&
                    s.ip === createServerDto.ip);
                if (createdServer && createdServer.id) {
                    this.logger.log(`✅ Found server with correct ID: ${createdServer.id}`);
                    return createdServer;
                }
            }
            return result;
        }
        catch (error) {
            this.logger.error(`❌ Failed to create server: ${error.message}`);
            throw error;
        }
    }
    async update(id, updateServerDto) {
        this.logger.log(`📝 Updating server with ID: ${id}`);
        return await this.serversService.update(id, updateServerDto);
    }
    async remove(id) {
        this.logger.log(`🗑️ Deleting server with ID: ${id}`);
        return await this.serversService.remove(id);
    }
};
exports.ServersController = ServersController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ServersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('count/total'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ServersController.prototype, "count", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ServersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ServersController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ServersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ServersController.prototype, "remove", null);
exports.ServersController = ServersController = ServersController_1 = __decorate([
    (0, common_1.Controller)('servers'),
    __metadata("design:paramtypes", [servers_service_1.ServersService])
], ServersController);
//# sourceMappingURL=servers.controller.js.map