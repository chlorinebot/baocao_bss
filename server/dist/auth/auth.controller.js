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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async login(loginDto) {
        try {
            if (!loginDto.username || !loginDto.password) {
                return {
                    success: false,
                    message: 'Tên đăng nhập và mật khẩu là bắt buộc'
                };
            }
            loginDto.username = loginDto.username.trim();
            loginDto.password = loginDto.password.trim();
            const result = await this.authService.validateUser(loginDto.username, loginDto.password);
            if (!result) {
                return {
                    success: false,
                    message: 'Tên đăng nhập hoặc mật khẩu không đúng'
                };
            }
            return {
                success: true,
                message: 'Đăng nhập thành công',
                token: result.access_token,
                user: result.user
            };
        }
        catch (error) {
            console.error('❌ Lỗi trong auth controller:', error);
            if (error instanceof common_1.HttpException) {
                return {
                    success: false,
                    message: error.message
                };
            }
            return {
                success: false,
                message: 'Có lỗi xảy ra trong quá trình đăng nhập. Vui lòng thử lại sau.'
            };
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map