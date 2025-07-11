"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const reports_controller_1 = require("./reports.controller");
const reports_service_1 = require("./reports.service");
const patroni_report_entity_1 = require("../entities/patroni-report.entity");
const heartbeat_report_entity_1 = require("../entities/heartbeat-report.entity");
const database_report_entity_1 = require("../entities/database-report.entity");
const warning_report_entity_1 = require("../entities/warning-report.entity");
const nemsm_report_entity_1 = require("../entities/nemsm-report.entity");
const report_entity_1 = require("../entities/report.entity");
const auth_module_1 = require("../auth/auth.module");
let ReportsModule = class ReportsModule {
};
exports.ReportsModule = ReportsModule;
exports.ReportsModule = ReportsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                report_entity_1.Report,
                patroni_report_entity_1.PatroniReport,
                heartbeat_report_entity_1.HeartbeatReport,
                database_report_entity_1.DatabaseReport,
                warning_report_entity_1.WarningReport,
                nemsm_report_entity_1.NemsmReport,
            ]),
            auth_module_1.AuthModule,
        ],
        controllers: [reports_controller_1.ReportsController],
        providers: [reports_service_1.ReportsService],
        exports: [reports_service_1.ReportsService],
    })
], ReportsModule);
//# sourceMappingURL=reports.module.js.map