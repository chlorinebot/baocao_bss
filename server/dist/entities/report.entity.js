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
exports.Report = void 0;
const typeorm_1 = require("typeorm");
const nemsm_report_entity_1 = require("./nemsm-report.entity");
const patroni_report_entity_1 = require("./patroni-report.entity");
const database_report_entity_1 = require("./database-report.entity");
const heartbeat_report_entity_1 = require("./heartbeat-report.entity");
const warning_report_entity_1 = require("./warning-report.entity");
let Report = class Report {
    ID;
    nemsm_report_id;
    patroni_report_id;
    database_report_id;
    heartbeat_report_id;
    warning_report_id;
    by_ID_user;
    created_at;
    nemsmReport;
    patroniReport;
    databaseReport;
    heartbeatReport;
    warningReport;
};
exports.Report = Report;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Report.prototype, "ID", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nemsm_report_id', nullable: true, type: 'int' }),
    __metadata("design:type", Object)
], Report.prototype, "nemsm_report_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'patroni_report_id', nullable: true, type: 'int' }),
    __metadata("design:type", Object)
], Report.prototype, "patroni_report_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'database_report_id', nullable: true, type: 'int' }),
    __metadata("design:type", Object)
], Report.prototype, "database_report_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'heartbeat_report_id', nullable: true, type: 'int' }),
    __metadata("design:type", Object)
], Report.prototype, "heartbeat_report_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'warning_report_id', nullable: true, type: 'int' }),
    __metadata("design:type", Object)
], Report.prototype, "warning_report_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'by_ID_user', type: 'int' }),
    __metadata("design:type", Number)
], Report.prototype, "by_ID_user", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Report.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => nemsm_report_entity_1.NemsmReport, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'nemsm_report_id' }),
    __metadata("design:type", Object)
], Report.prototype, "nemsmReport", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => patroni_report_entity_1.PatroniReport, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'patroni_report_id' }),
    __metadata("design:type", Object)
], Report.prototype, "patroniReport", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => database_report_entity_1.DatabaseReport, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'database_report_id' }),
    __metadata("design:type", Object)
], Report.prototype, "databaseReport", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => heartbeat_report_entity_1.HeartbeatReport, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'heartbeat_report_id' }),
    __metadata("design:type", Object)
], Report.prototype, "heartbeatReport", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => warning_report_entity_1.WarningReport, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'warning_report_id' }),
    __metadata("design:type", Object)
], Report.prototype, "warningReport", void 0);
exports.Report = Report = __decorate([
    (0, typeorm_1.Entity)('reports')
], Report);
//# sourceMappingURL=report.entity.js.map