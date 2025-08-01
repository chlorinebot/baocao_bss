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
const report_entity_1 = require("./report.entity");
const reports_service_1 = require("./reports.service");
const reports_controller_1 = require("./reports.controller");
const nemsm_report_entity_1 = require("../entities/nemsm-report.entity");
const nemsm_reports_service_1 = require("./nemsm-reports.service");
const nemsm_reports_controller_1 = require("./nemsm-reports.controller");
const apisix_report_entity_1 = require("../entities/apisix-report.entity");
const apisix_reports_service_1 = require("./apisix-reports.service");
const apisix_reports_controller_1 = require("./apisix-reports.controller");
const patroni_report_entity_1 = require("../entities/patroni-report.entity");
const patroni_reports_service_1 = require("./patroni-reports.service");
const patroni_reports_controller_1 = require("./patroni-reports.controller");
const transaction_report_entity_1 = require("../entities/transaction-report.entity");
const transaction_reports_service_1 = require("./transaction-reports.service");
const transaction_reports_controller_1 = require("./transaction-reports.controller");
const heartbeat_report_entity_1 = require("../entities/heartbeat-report.entity");
const heartbeat_reports_service_1 = require("./heartbeat-reports.service");
const heartbeat_reports_controller_1 = require("./heartbeat-reports.controller");
const alert_report_entity_1 = require("../entities/alert-report.entity");
const alert_reports_service_1 = require("./alert-reports.service");
const alert_reports_controller_1 = require("./alert-reports.controller");
const work_schedule_module_1 = require("../work-schedule/work-schedule.module");
let ReportsModule = class ReportsModule {
};
exports.ReportsModule = ReportsModule;
exports.ReportsModule = ReportsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([report_entity_1.Report, nemsm_report_entity_1.NemsmReport, apisix_report_entity_1.ApisixReport, patroni_report_entity_1.PatroniReport, transaction_report_entity_1.TransactionReport, heartbeat_report_entity_1.HeartbeatReport, alert_report_entity_1.AlertReport]),
            work_schedule_module_1.WorkScheduleModule
        ],
        providers: [reports_service_1.ReportsService, nemsm_reports_service_1.NemsmReportsService, apisix_reports_service_1.ApisixReportsService, patroni_reports_service_1.PatroniReportsService, transaction_reports_service_1.TransactionReportsService, heartbeat_reports_service_1.HeartbeatReportsService, alert_reports_service_1.AlertReportsService],
        controllers: [reports_controller_1.ReportsController, nemsm_reports_controller_1.NemsmReportsController, apisix_reports_controller_1.ApisixReportsController, patroni_reports_controller_1.PatroniReportsController, transaction_reports_controller_1.TransactionReportsController, heartbeat_reports_controller_1.HeartbeatReportsController, alert_reports_controller_1.AlertReportsController],
        exports: [reports_service_1.ReportsService, nemsm_reports_service_1.NemsmReportsService, apisix_reports_service_1.ApisixReportsService, patroni_reports_service_1.PatroniReportsService, transaction_reports_service_1.TransactionReportsService, heartbeat_reports_service_1.HeartbeatReportsService, alert_reports_service_1.AlertReportsService],
    })
], ReportsModule);
//# sourceMappingURL=reports.module.js.map