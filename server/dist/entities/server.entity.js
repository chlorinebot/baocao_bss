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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const typeorm_1 = require("typeorm");
let Server = class Server {
    id;
    server_name;
    ip;
    ensureIdIsNumber() {
        if (this.id === undefined || this.id === null) {
            this.id = 0;
        }
    }
};
exports.Server = Server;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({
        name: 'id',
        type: 'int',
        unsigned: true,
    }),
    __metadata("design:type", Number)
], Server.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'server_name', length: 255, nullable: false }),
    __metadata("design:type", String)
], Server.prototype, "server_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ip', length: 45, nullable: false }),
    __metadata("design:type", String)
], Server.prototype, "ip", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Server.prototype, "ensureIdIsNumber", null);
exports.Server = Server = __decorate([
    (0, typeorm_1.Entity)('nemsm')
], Server);
//# sourceMappingURL=server.entity.js.map