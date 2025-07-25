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
const report_entity_1 = require("../reports/report.entity");
const server_entity_1 = require("./server.entity");
let NemsmReport = class NemsmReport {
    id;
    id_report_id;
    id_nemsm;
    cpu;
    memory;
    disk_space_used;
    network_traffic;
    netstat;
    notes;
    report;
    server;
};
exports.NemsmReport = NemsmReport;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({
        name: 'id',
        type: 'int',
        unsigned: true,
    }),
    __metadata("design:type", Number)
], NemsmReport.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_report_id', type: 'int', nullable: false }),
    __metadata("design:type", Number)
], NemsmReport.prototype, "id_report_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_nemsm', type: 'int', nullable: false }),
    __metadata("design:type", Number)
], NemsmReport.prototype, "id_nemsm", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cpu', type: 'varchar', length: 10, nullable: true, default: 'false' }),
    __metadata("design:type", String)
], NemsmReport.prototype, "cpu", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'memory', type: 'varchar', length: 10, nullable: true, default: 'false' }),
    __metadata("design:type", String)
], NemsmReport.prototype, "memory", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'disk_space_used', type: 'varchar', length: 10, nullable: true, default: 'false' }),
    __metadata("design:type", String)
], NemsmReport.prototype, "disk_space_used", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'network_traffic', type: 'varchar', length: 10, nullable: true, default: 'false' }),
    __metadata("design:type", String)
], NemsmReport.prototype, "network_traffic", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'netstat', type: 'varchar', length: 10, nullable: true, default: 'false' }),
    __metadata("design:type", String)
], NemsmReport.prototype, "netstat", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], NemsmReport.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => report_entity_1.Report),
    (0, typeorm_1.JoinColumn)({ name: 'id_report_id' }),
    __metadata("design:type", report_entity_1.Report)
], NemsmReport.prototype, "report", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => server_entity_1.Server),
    (0, typeorm_1.JoinColumn)({ name: 'id_nemsm' }),
    __metadata("design:type", server_entity_1.Server)
], NemsmReport.prototype, "server", void 0);
exports.NemsmReport = NemsmReport = __decorate([
    (0, typeorm_1.Entity)('nemsm_reports')
], NemsmReport);
//# sourceMappingURL=nemsm-report.entity.js.map