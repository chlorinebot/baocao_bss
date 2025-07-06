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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
let AuthService = class AuthService {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async validateUser(username, password) {
        try {
            console.log(`🔐 Đang xác thực user: ${username}`);
            const user = await this.usersService.findByUsername(username);
            if (!user) {
                console.log(`❌ Không tìm thấy user: ${username}`);
                return null;
            }
            console.log(`✅ Tìm thấy user: ${username}, ID: ${user.id}`);
            const isPasswordValid = await this.usersService.verifyPassword(password, user.password);
            if (!isPasswordValid) {
                console.log(`❌ Mật khẩu không đúng cho user: ${username}`);
                return null;
            }
            console.log(`✅ Mật khẩu đúng cho user: ${username}`);
            const access_token = `token_${user.id}_${Date.now()}`;
            let birthdayString = '';
            if (user.birthday) {
                try {
                    if (user.birthday instanceof Date) {
                        birthdayString = user.birthday.toISOString().split('T')[0];
                    }
                    else if (typeof user.birthday === 'string') {
                        birthdayString = user.birthday;
                    }
                }
                catch (error) {
                    console.log('⚠️ Lỗi xử lý birthday:', error.message);
                    birthdayString = '';
                }
            }
            const loginResponse = {
                access_token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role_id: user.role_id,
                    birthday: birthdayString,
                    createdAt: user.createdAt.toISOString(),
                    updatedAt: user.updatedAt.toISOString()
                }
            };
            console.log(`✅ Đăng nhập thành công cho user: ${username}`);
            return loginResponse;
        }
        catch (error) {
            console.error('❌ Lỗi trong validateUser:', error);
            return null;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], AuthService);
//# sourceMappingURL=auth.service.js.map