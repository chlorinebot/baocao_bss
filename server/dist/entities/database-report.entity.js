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
exports.DatabaseReport = void 0;
const typeorm_1 = require("typeorm");
let DatabaseReport = class DatabaseReport {
    ID;
    Transactions_giam_sat;
    Note;
    created_at;
    by_ID_user;
};
exports.DatabaseReport = DatabaseReport;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], DatabaseReport.prototype, "ID", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Transactions_giam_sat', type: 'text', nullable: true }),
    __metadata("design:type", String)
], DatabaseReport.prototype, "Transactions_giam_sat", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Note', type: 'text', nullable: true }),
    __metadata("design:type", String)
], DatabaseReport.prototype, "Note", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], DatabaseReport.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'by_ID_user', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], DatabaseReport.prototype, "by_ID_user", void 0);
exports.DatabaseReport = DatabaseReport = __decorate([
    (0, typeorm_1.Entity)('database_reports')
], DatabaseReport);
//# sourceMappingURL=database-report.entity.js.map