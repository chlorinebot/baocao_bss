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
exports.NemsmReport = void 0;
const typeorm_1 = require("typeorm");
let NemsmReport = class NemsmReport {
    ID;
    ID_NEmSM;
    CPU;
    Memory;
    Disk_space_user;
    Network_traffic;
    Netstat;
    Note;
    created_at;
    by_ID_user;
};
exports.NemsmReport = NemsmReport;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], NemsmReport.prototype, "ID", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ID_NEmSM', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], NemsmReport.prototype, "ID_NEmSM", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'CPU', type: 'text', nullable: true }),
    __metadata("design:type", String)
], NemsmReport.prototype, "CPU", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Memory', type: 'text', nullable: true }),
    __metadata("design:type", String)
], NemsmReport.prototype, "Memory", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Disk_space_user', type: 'text', nullable: true }),
    __metadata("design:type", String)
], NemsmReport.prototype, "Disk_space_user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Network_traffic', type: 'text', nullable: true }),
    __metadata("design:type", String)
], NemsmReport.prototype, "Network_traffic", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Netstat', type: 'text', nullable: true }),
    __metadata("design:type", String)
], NemsmReport.prototype, "Netstat", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Note', type: 'text', nullable: true }),
    __metadata("design:type", String)
], NemsmReport.prototype, "Note", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], NemsmReport.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'by_ID_user', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], NemsmReport.prototype, "by_ID_user", void 0);
exports.NemsmReport = NemsmReport = __decorate([
    (0, typeorm_1.Entity)('nemsm_reports')
], NemsmReport);
//# sourceMappingURL=nemsm-report.entity.js.map