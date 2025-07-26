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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonthlySchedulesController = void 0;
const common_1 = require("@nestjs/common");
const monthly_schedules_service_1 = require("./monthly-schedules.service");
let MonthlySchedulesController = class MonthlySchedulesController {
    monthlySchedulesService;
    constructor(monthlySchedulesService) {
        this.monthlySchedulesService = monthlySchedulesService;
    }
    async getAllMonthlySchedules() {
        console.log('🎯 [MonthlySchedulesController] GET /monthly-schedules called');
        try {
            const result = await this.monthlySchedulesService.getAllMonthlySchedules();
            console.log('✅ [MonthlySchedulesController] getAllMonthlySchedules result:', result);
            return { success: true, data: result };
        }
        catch (error) {
            console.error('❌ [MonthlySchedulesController] Error in getAllMonthlySchedules:', error);
            return { success: false, error: error.message };
        }
    }
    async getMonthlySchedule(year, month) {
        console.log(`🎯 [MonthlySchedulesController] GET /monthly-schedules/${year}/${month} called`);
        try {
            const result = await this.monthlySchedulesService.getMonthlySchedule(month, year);
            console.log('✅ [MonthlySchedulesController] getMonthlySchedule result:', result);
            return { success: true, data: result };
        }
        catch (error) {
            console.error('❌ [MonthlySchedulesController] Error in getMonthlySchedule:', error);
            return { success: false, error: error.message };
        }
    }
    async createMonthlySchedule(createData) {
        console.log('🎯 [MonthlySchedulesController] POST /monthly-schedules called');
        console.log('📋 [MonthlySchedulesController] Create data:', createData);
        try {
            const result = await this.monthlySchedulesService.createMonthlySchedule(createData.month, createData.year, createData.created_by);
            console.log('✅ [MonthlySchedulesController] createMonthlySchedule result:', result);
            return { success: true, data: result };
        }
        catch (error) {
            console.error('❌ [MonthlySchedulesController] Error in createMonthlySchedule:', error);
            return { success: false, error: error.message };
        }
    }
    async generateAutoSchedule(generateData) {
        console.log('🎯 [MonthlySchedulesController] POST /monthly-schedules/auto-generate called');
        console.log('📋 [MonthlySchedulesController] Generate data:', generateData);
        try {
            console.log('🔄 [MonthlySchedulesController] Calling service generateAutoSchedule...');
            const result = await this.monthlySchedulesService.generateAutoSchedule(generateData.month, generateData.year, generateData.created_by, generateData.starting_role || 'A');
            console.log('✅ [MonthlySchedulesController] Service returned result:', result);
            return result;
        }
        catch (error) {
            console.error('❌ [MonthlySchedulesController] Exception in generateAutoSchedule:', error);
            console.error('❌ [MonthlySchedulesController] Error stack:', error.stack);
            return { success: false, error: error.message };
        }
    }
    async updateMonthlySchedule(id, updateData) {
        console.log(`🎯 [MonthlySchedulesController] PUT /monthly-schedules/${id} called`);
        console.log('📋 [MonthlySchedulesController] Update data:', updateData);
        try {
            const result = await this.monthlySchedulesService.updateMonthlySchedule(id, JSON.stringify(updateData.schedule_data), updateData.updated_by || 1);
            console.log('✅ [MonthlySchedulesController] updateMonthlySchedule result:', result);
            return { success: true, data: result };
        }
        catch (error) {
            console.error('❌ [MonthlySchedulesController] Error in updateMonthlySchedule:', error);
            return { success: false, error: error.message };
        }
    }
    async deleteMonthlySchedule(id, deleteData) {
        console.log(`🎯 [MonthlySchedulesController] DELETE /monthly-schedules/${id} called`);
        console.log('📋 [MonthlySchedulesController] Delete data:', deleteData);
        try {
            const result = await this.monthlySchedulesService.deleteMonthlySchedule(id, deleteData?.deleted_by || 1);
            console.log('✅ [MonthlySchedulesController] deleteMonthlySchedule result:', result);
            return { success: true, message: result.message };
        }
        catch (error) {
            console.error('❌ [MonthlySchedulesController] Error in deleteMonthlySchedule:', error);
            return { success: false, error: error.message };
        }
    }
};
exports.MonthlySchedulesController = MonthlySchedulesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonthlySchedulesController.prototype, "getAllMonthlySchedules", null);
__decorate([
    (0, common_1.Get)(':year/:month'),
    __param(0, (0, common_1.Param)('year')),
    __param(1, (0, common_1.Param)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], MonthlySchedulesController.prototype, "getMonthlySchedule", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MonthlySchedulesController.prototype, "createMonthlySchedule", null);
__decorate([
    (0, common_1.Post)('auto-generate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MonthlySchedulesController.prototype, "generateAutoSchedule", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], MonthlySchedulesController.prototype, "updateMonthlySchedule", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], MonthlySchedulesController.prototype, "deleteMonthlySchedule", null);
exports.MonthlySchedulesController = MonthlySchedulesController = __decorate([
    (0, common_1.Controller)('monthly-schedules'),
    __metadata("design:paramtypes", [monthly_schedules_service_1.MonthlySchedulesService])
], MonthlySchedulesController);
//# sourceMappingURL=monthly-schedules.controller.js.map