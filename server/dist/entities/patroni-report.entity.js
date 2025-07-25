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
exports.PatroniReport = void 0;
const typeorm_1 = require("typeorm");
const report_entity_1 = require("../reports/report.entity");
let PatroniReport = class PatroniReport {
    id;
    id_report_id;
    row_index;
    primary_node;
    wal_replay_paused;
    replicas_received_wal;
    primary_wal_location;
    replicas_replayed_wal;
    notes;
    report;
};
exports.PatroniReport = PatroniReport;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({
        name: 'id',
        type: 'int',
        unsigned: true,
    }),
    __metadata("design:type", Number)
], PatroniReport.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_report_id', type: 'int', nullable: false }),
    __metadata("design:type", Number)
], PatroniReport.prototype, "id_report_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'row_index', type: 'int', nullable: false }),
    __metadata("design:type", Number)
], PatroniReport.prototype, "row_index", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'primary_node', type: 'varchar', length: 10, nullable: true, default: 'false' }),
    __metadata("design:type", String)
], PatroniReport.prototype, "primary_node", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'wal_replay_paused', type: 'varchar', length: 10, nullable: true, default: 'false' }),
    __metadata("design:type", String)
], PatroniReport.prototype, "wal_replay_paused", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'replicas_received_wal', type: 'varchar', length: 10, nullable: true, default: 'false' }),
    __metadata("design:type", String)
], PatroniReport.prototype, "replicas_received_wal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'primary_wal_location', type: 'varchar', length: 10, nullable: true, default: 'false' }),
    __metadata("design:type", String)
], PatroniReport.prototype, "primary_wal_location", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'replicas_replayed_wal', type: 'varchar', length: 10, nullable: true, default: 'false' }),
    __metadata("design:type", String)
], PatroniReport.prototype, "replicas_replayed_wal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PatroniReport.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => report_entity_1.Report),
    (0, typeorm_1.JoinColumn)({ name: 'id_report_id' }),
    __metadata("design:type", report_entity_1.Report)
], PatroniReport.prototype, "report", void 0);
exports.PatroniReport = PatroniReport = __decorate([
    (0, typeorm_1.Entity)('patroni_reports')
], PatroniReport);
//# sourceMappingURL=patroni-report.entity.js.map