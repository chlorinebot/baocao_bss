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
let HeartbeatReport = class HeartbeatReport {
    ID;
    Post_heartbeat_10_2_45_86;
    Post_heartbeat_10_2_45_87;
    Post_heartbeat_10_2_45_88;
    Note;
    created_at;
    by_ID_user;
};
exports.HeartbeatReport = HeartbeatReport;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], HeartbeatReport.prototype, "ID", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Post_heartbeat_10_2_45_86', type: 'text', nullable: true }),
    __metadata("design:type", String)
], HeartbeatReport.prototype, "Post_heartbeat_10_2_45_86", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Post_heartbeat_10_2_45_87', type: 'text', nullable: true }),
    __metadata("design:type", String)
], HeartbeatReport.prototype, "Post_heartbeat_10_2_45_87", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Post_heartbeat_10_2_45_88', type: 'text', nullable: true }),
    __metadata("design:type", String)
], HeartbeatReport.prototype, "Post_heartbeat_10_2_45_88", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Note', type: 'text', nullable: true }),
    __metadata("design:type", String)
], HeartbeatReport.prototype, "Note", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], HeartbeatReport.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'by_ID_user', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], HeartbeatReport.prototype, "by_ID_user", void 0);
exports.HeartbeatReport = HeartbeatReport = __decorate([
    (0, typeorm_1.Entity)('heartbeat_reports')
], HeartbeatReport);
//# sourceMappingURL=heartbeat-report.entity.js.map