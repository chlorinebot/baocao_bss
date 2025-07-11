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
exports.WarningReport = void 0;
const typeorm_1 = require("typeorm");
let WarningReport = class WarningReport {
    ID;
    Warning_Critical;
    info_backup_database;
    Note;
    created_at;
    by_ID_user;
};
exports.WarningReport = WarningReport;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], WarningReport.prototype, "ID", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Warning_Critical', type: 'text', nullable: true }),
    __metadata("design:type", String)
], WarningReport.prototype, "Warning_Critical", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'info_backup_database', type: 'text', nullable: true }),
    __metadata("design:type", String)
], WarningReport.prototype, "info_backup_database", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Note', type: 'text', nullable: true }),
    __metadata("design:type", String)
], WarningReport.prototype, "Note", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], WarningReport.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'by_ID_user', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], WarningReport.prototype, "by_ID_user", void 0);
exports.WarningReport = WarningReport = __decorate([
    (0, typeorm_1.Entity)('warning_reports')
], WarningReport);
//# sourceMappingURL=warning-report.entity.js.map