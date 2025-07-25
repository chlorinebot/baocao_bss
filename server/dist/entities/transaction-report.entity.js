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
exports.TransactionReport = void 0;
const typeorm_1 = require("typeorm");
const report_entity_1 = require("../reports/report.entity");
let TransactionReport = class TransactionReport {
    id;
    id_report_id;
    row_index;
    transaction_monitored;
    notes;
    report;
};
exports.TransactionReport = TransactionReport;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({
        name: 'id',
        type: 'int',
        unsigned: true,
    }),
    __metadata("design:type", Number)
], TransactionReport.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_report_id', type: 'int', nullable: false }),
    __metadata("design:type", Number)
], TransactionReport.prototype, "id_report_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'row_index', type: 'int', nullable: false }),
    __metadata("design:type", Number)
], TransactionReport.prototype, "row_index", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transaction_monitored', type: 'varchar', length: 10, nullable: true, default: 'false' }),
    __metadata("design:type", String)
], TransactionReport.prototype, "transaction_monitored", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], TransactionReport.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => report_entity_1.Report),
    (0, typeorm_1.JoinColumn)({ name: 'id_report_id' }),
    __metadata("design:type", report_entity_1.Report)
], TransactionReport.prototype, "report", void 0);
exports.TransactionReport = TransactionReport = __decorate([
    (0, typeorm_1.Entity)('transaction_reports')
], TransactionReport);
//# sourceMappingURL=transaction-report.entity.js.map