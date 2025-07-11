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
exports.CreateReportDto = exports.AlertDto = exports.HeartbeatDto = exports.TransactionDto = exports.PatroniDto = exports.NodeExporterDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class NodeExporterDto {
    cpu;
    memory;
    disk;
    network;
    netstat;
    note;
}
exports.NodeExporterDto = NodeExporterDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], NodeExporterDto.prototype, "cpu", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], NodeExporterDto.prototype, "memory", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], NodeExporterDto.prototype, "disk", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], NodeExporterDto.prototype, "network", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], NodeExporterDto.prototype, "netstat", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NodeExporterDto.prototype, "note", void 0);
class PatroniDto {
    primaryNode;
    walReplayPaused;
    replicasReceivedWal;
    primaryWalLocation;
    replicasReplayedWal;
    note;
}
exports.PatroniDto = PatroniDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PatroniDto.prototype, "primaryNode", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PatroniDto.prototype, "walReplayPaused", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PatroniDto.prototype, "replicasReceivedWal", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PatroniDto.prototype, "primaryWalLocation", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PatroniDto.prototype, "replicasReplayedWal", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PatroniDto.prototype, "note", void 0);
class TransactionDto {
    monitored;
    note;
}
exports.TransactionDto = TransactionDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TransactionDto.prototype, "monitored", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransactionDto.prototype, "note", void 0);
class HeartbeatDto {
    heartbeat86;
    heartbeat87;
    heartbeat88;
    note;
}
exports.HeartbeatDto = HeartbeatDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], HeartbeatDto.prototype, "heartbeat86", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], HeartbeatDto.prototype, "heartbeat87", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], HeartbeatDto.prototype, "heartbeat88", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HeartbeatDto.prototype, "note", void 0);
class AlertDto {
    warning;
    critical;
    info;
    infoBackup;
    warningDisk;
    other;
    note1;
    note2;
}
exports.AlertDto = AlertDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AlertDto.prototype, "warning", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AlertDto.prototype, "critical", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AlertDto.prototype, "info", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AlertDto.prototype, "infoBackup", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AlertDto.prototype, "warningDisk", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AlertDto.prototype, "other", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AlertDto.prototype, "note1", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AlertDto.prototype, "note2", void 0);
class CreateReportDto {
    nodeExporter;
    patroni;
    transactions;
    heartbeat;
    alerts;
}
exports.CreateReportDto = CreateReportDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_transformer_1.Type)(() => NodeExporterDto),
    __metadata("design:type", Array)
], CreateReportDto.prototype, "nodeExporter", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_transformer_1.Type)(() => PatroniDto),
    __metadata("design:type", Array)
], CreateReportDto.prototype, "patroni", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_transformer_1.Type)(() => TransactionDto),
    __metadata("design:type", Array)
], CreateReportDto.prototype, "transactions", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_transformer_1.Type)(() => HeartbeatDto),
    __metadata("design:type", Array)
], CreateReportDto.prototype, "heartbeat", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => AlertDto),
    __metadata("design:type", AlertDto)
], CreateReportDto.prototype, "alerts", void 0);
//# sourceMappingURL=create-report.dto.js.map