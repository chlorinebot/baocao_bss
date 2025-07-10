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
const user_entity_1 = require("./user.entity");
let Report = class Report {
    id;
    title;
    description;
    type;
    checkboxItems;
    generalNote;
    status;
    createdBy;
    approvedBy;
    approvedAt;
    reportDate;
    isActive;
    createdAt;
    updatedAt;
    creator;
    approver;
};
exports.Report = Report;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Report.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, comment: 'Tiêu đề báo cáo' }),
    __metadata("design:type", String)
], Report.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', comment: 'Mô tả chi tiết báo cáo' }),
    __metadata("design:type", String)
], Report.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['daily', 'weekly', 'monthly', 'project', 'incident'], comment: 'Loại báo cáo' }),
    __metadata("design:type", String)
], Report.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', comment: 'Danh sách các mục checkbox với trạng thái' }),
    __metadata("design:type", Array)
], Report.prototype, "checkboxItems", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, comment: 'Ghi chú chung của báo cáo' }),
    __metadata("design:type", Object)
], Report.prototype, "generalNote", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['draft', 'submitted', 'approved', 'rejected'], default: 'draft', comment: 'Trạng thái báo cáo' }),
    __metadata("design:type", String)
], Report.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', comment: 'ID người tạo báo cáo' }),
    __metadata("design:type", Number)
], Report.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true, comment: 'ID người duyệt báo cáo' }),
    __metadata("design:type", Number)
], Report.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true, comment: 'Ngày giờ duyệt báo cáo' }),
    __metadata("design:type", Date)
], Report.prototype, "approvedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', comment: 'Ngày báo cáo' }),
    __metadata("design:type", Date)
], Report.prototype, "reportDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true, comment: 'Trạng thái hoạt động' }),
    __metadata("design:type", Boolean)
], Report.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: 'datetime',
        comment: 'Ngày giờ tạo báo cáo',
        default: () => 'CURRENT_TIMESTAMP'
    }),
    __metadata("design:type", Date)
], Report.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: 'datetime',
        comment: 'Ngày giờ cập nhật cuối cùng',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP'
    }),
    __metadata("design:type", Date)
], Report.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'createdBy', referencedColumnName: 'id' }),
    __metadata("design:type", user_entity_1.User)
], Report.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'approvedBy', referencedColumnName: 'id' }),
    __metadata("design:type", user_entity_1.User)
], Report.prototype, "approver", void 0);
exports.Report = Report = __decorate([
    (0, typeorm_1.Entity)('nemsm_reports')
], Report);
//# sourceMappingURL=report.entity.js.map