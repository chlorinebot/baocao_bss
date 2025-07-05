"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkScheduleModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const work_schedule_entity_1 = require("../entities/work-schedule.entity");
const user_entity_1 = require("../entities/user.entity");
const work_schedule_service_1 = require("./work-schedule.service");
const work_schedule_controller_1 = require("./work-schedule.controller");
let WorkScheduleModule = class WorkScheduleModule {
};
exports.WorkScheduleModule = WorkScheduleModule;
exports.WorkScheduleModule = WorkScheduleModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([work_schedule_entity_1.WorkSchedule, user_entity_1.User])],
        controllers: [work_schedule_controller_1.WorkScheduleController],
        providers: [work_schedule_service_1.WorkScheduleService],
        exports: [work_schedule_service_1.WorkScheduleService],
    })
], WorkScheduleModule);
//# sourceMappingURL=work-schedule.module.js.map