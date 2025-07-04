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
            const user = await this.usersService.findByUsername(username);
            if (!user) {
                return null;
            }
            const isPasswordValid = await this.usersService.verifyPassword(password, user.password);
            if (!isPasswordValid) {
                return null;
            }
            const access_token = `token_${user.id}_${Date.now()}`;
            return {
                access_token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role_id: user.role_id,
                    birthday: user.birthday ? user.birthday.toISOString().split('T')[0] : '',
                    createdAt: user.createdAt.toISOString(),
                    updatedAt: user.updatedAt.toISOString()
                }
            };
        }
        catch (error) {
            console.error('Error in validateUser:', error);
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