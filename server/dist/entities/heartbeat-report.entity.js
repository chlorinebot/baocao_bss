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
exports.HeartbeatReport = void 0;
const typeorm_1 = require("typeorm");
const report_entity_1 = require("../reports/report.entity");
let HeartbeatReport = class HeartbeatReport {
    id;
    id_report_id;
    row_index;
    heartbeat_86;
    heartbeat_87;
    heartbeat_88;
    notes;
    report;
};
exports.HeartbeatReport = HeartbeatReport;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({
        name: 'id',
        type: 'int',
        unsigned: true,
    }),
    __metadata("design:type", Number)
], HeartbeatReport.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_report_id', type: 'int', nullable: false }),
    __metadata("design:type", Number)
], HeartbeatReport.prototype, "id_report_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'row_index', type: 'int', nullable: false }),
    __metadata("design:type", Number)
], HeartbeatReport.prototype, "row_index", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'heartbeat_86', type: 'varchar', length: 10, nullable: true, default: 'false' }),
    __metadata("design:type", String)
], HeartbeatReport.prototype, "heartbeat_86", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'heartbeat_87', type: 'varchar', length: 10, nullable: true, default: 'false' }),
    __metadata("design:type", String)
], HeartbeatReport.prototype, "heartbeat_87", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'heartbeat_88', type: 'varchar', length: 10, nullable: true, default: 'false' }),
    __metadata("design:type", String)
], HeartbeatReport.prototype, "heartbeat_88", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], HeartbeatReport.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => report_entity_1.Report),
    (0, typeorm_1.JoinColumn)({ name: 'id_report_id' }),
    __metadata("design:type", report_entity_1.Report)
], HeartbeatReport.prototype, "report", void 0);
exports.HeartbeatReport = HeartbeatReport = __decorate([
    (0, typeorm_1.Entity)('heartbeat_reports')
], HeartbeatReport);
//# sourceMappingURL=heartbeat-report.entity.js.map