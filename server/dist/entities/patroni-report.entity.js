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
let PatroniReport = class PatroniReport {
    ID;
    PatroniLeader;
    Patroni_Primary_Node_10_2_45_86;
    WAL_Replay_Paused;
    Replicas_Received_WAL_Location;
    Primary_WAL_Location;
    Replicas_Replayed_WAL_Location;
    Note;
    created_at;
    by_ID_user;
};
exports.PatroniReport = PatroniReport;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PatroniReport.prototype, "ID", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PatroniLeader', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PatroniReport.prototype, "PatroniLeader", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Patroni_Primary_Node_10_2_45_86', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PatroniReport.prototype, "Patroni_Primary_Node_10_2_45_86", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'WAL_Replay_Paused', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PatroniReport.prototype, "WAL_Replay_Paused", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Replicas_Received_WAL_Location', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PatroniReport.prototype, "Replicas_Received_WAL_Location", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Primary_WAL_Location', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PatroniReport.prototype, "Primary_WAL_Location", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Replicas_Replayed_WAL_Location', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PatroniReport.prototype, "Replicas_Replayed_WAL_Location", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Note', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PatroniReport.prototype, "Note", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PatroniReport.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'by_ID_user', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], PatroniReport.prototype, "by_ID_user", void 0);
exports.PatroniReport = PatroniReport = __decorate([
    (0, typeorm_1.Entity)('patroni_reports')
], PatroniReport);
//# sourceMappingURL=patroni-report.entity.js.map