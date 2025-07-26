"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonthlySchedulesModule = void 0;
const common_1 = require("@nestjs/common");
const monthly_schedules_controller_1 = require("./monthly-schedules.controller");
const monthly_schedules_service_1 = require("./monthly-schedules.service");
let MonthlySchedulesModule = class MonthlySchedulesModule {
};
exports.MonthlySchedulesModule = MonthlySchedulesModule;
exports.MonthlySchedulesModule = MonthlySchedulesModule = __decorate([
    (0, common_1.Module)({
        controllers: [monthly_schedules_controller_1.MonthlySchedulesController],
        providers: [monthly_schedules_service_1.MonthlySchedulesService],
        exports: [monthly_schedules_service_1.MonthlySchedulesService],
    })
], MonthlySchedulesModule);
//# sourceMappingURL=monthly-schedules.module.js.map