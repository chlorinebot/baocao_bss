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
exports.WorkSchedule = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
let WorkSchedule = class WorkSchedule {
    id;
    employee_a;
    employee_b;
    employee_c;
    employee_d;
    active;
    created_date;
    updated_date;
    activation_date;
    employeeA;
    employeeB;
    employeeC;
    employeeD;
};
exports.WorkSchedule = WorkSchedule;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], WorkSchedule.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', comment: 'ID của nhân viên A' }),
    __metadata("design:type", Number)
], WorkSchedule.prototype, "employee_a", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', comment: 'ID của nhân viên B' }),
    __metadata("design:type", Number)
], WorkSchedule.prototype, "employee_b", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', comment: 'ID của nhân viên C' }),
    __metadata("design:type", Number)
], WorkSchedule.prototype, "employee_c", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', comment: 'ID của nhân viên D' }),
    __metadata("design:type", Number)
], WorkSchedule.prototype, "employee_d", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true, comment: 'Trạng thái hoạt động' }),
    __metadata("design:type", Boolean)
], WorkSchedule.prototype, "active", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: 'datetime',
        comment: 'Ngày giờ tạo phân công',
        default: () => 'CURRENT_TIMESTAMP'
    }),
    __metadata("design:type", Date)
], WorkSchedule.prototype, "created_date", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: 'datetime',
        comment: 'Ngày giờ cập nhật cuối cùng',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP'
    }),
    __metadata("design:type", Date)
], WorkSchedule.prototype, "updated_date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'date',
        comment: 'Ngày phân công có hiệu lực',
        default: () => 'CURDATE()'
    }),
    __metadata("design:type", Date)
], WorkSchedule.prototype, "activation_date", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'employee_a', referencedColumnName: 'id' }),
    __metadata("design:type", user_entity_1.User)
], WorkSchedule.prototype, "employeeA", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'employee_b', referencedColumnName: 'id' }),
    __metadata("design:type", user_entity_1.User)
], WorkSchedule.prototype, "employeeB", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'employee_c', referencedColumnName: 'id' }),
    __metadata("design:type", user_entity_1.User)
], WorkSchedule.prototype, "employeeC", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'employee_d', referencedColumnName: 'id' }),
    __metadata("design:type", user_entity_1.User)
], WorkSchedule.prototype, "employeeD", void 0);
exports.WorkSchedule = WorkSchedule = __decorate([
    (0, typeorm_1.Entity)('work_schedule')
], WorkSchedule);
//# sourceMappingURL=work-schedule.entity.js.map