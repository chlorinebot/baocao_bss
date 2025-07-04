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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async findAll() {
        return await this.usersService.findAll();
    }
    async findOne(id) {
        const user = await this.usersService.findOne(+id);
        if (!user) {
            throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
        }
        return user;
    }
    async create(userData) {
        try {
            const user = await this.usersService.create(userData);
            const { password, ...userWithoutPassword } = user;
            return {
                message: 'Đăng ký thành công',
                user: userWithoutPassword
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Có lỗi xảy ra khi tạo tài khoản', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async update(id, userData) {
        try {
            const user = await this.usersService.update(+id, userData);
            if (!user) {
                throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
            }
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Có lỗi xảy ra khi cập nhật tài khoản', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updatePassword(id, body) {
        try {
            const targetUserId = +id;
            const { password, adminId, adminRoleId } = body;
            if (!password || password.length < 6) {
                throw new common_1.HttpException('Mật khẩu phải có ít nhất 6 ký tự', common_1.HttpStatus.BAD_REQUEST);
            }
            const targetUser = await this.usersService.findOne(targetUserId);
            if (!targetUser) {
                throw new common_1.HttpException('Không tìm thấy người dùng', common_1.HttpStatus.NOT_FOUND);
            }
            const adminUser = await this.usersService.findOne(adminId);
            if (!adminUser || adminUser.role_id !== 1) {
                throw new common_1.HttpException('Không có quyền thực hiện thao tác này', common_1.HttpStatus.FORBIDDEN);
            }
            const canChangePassword = this.checkPasswordChangePermission(adminUser, targetUser);
            if (!canChangePassword) {
                throw new common_1.HttpException('Bạn không có quyền đổi mật khẩu của người dùng này', common_1.HttpStatus.FORBIDDEN);
            }
            const hashedPassword = await this.usersService.hashPassword(password);
            await this.usersService.updatePassword(targetUserId, hashedPassword);
            return { message: 'Đổi mật khẩu thành công' };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Có lỗi xảy ra khi đổi mật khẩu', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    checkPasswordChangePermission(adminUser, targetUser) {
        if (adminUser.role_id === 1 && targetUser.role_id === 2) {
            return true;
        }
        if (adminUser.role_id === 1 && targetUser.role_id === 1) {
            return adminUser.id === targetUser.id;
        }
        return false;
    }
    async remove(id) {
        try {
            await this.usersService.remove(+id);
            return { message: 'User deleted successfully' };
        }
        catch (error) {
            throw new common_1.HttpException('Có lỗi xảy ra khi xóa tài khoản', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async count() {
        const count = await this.usersService.count();
        return { count };
    }
    async login(loginDto) {
        try {
            const user = await this.usersService.findByUsername(loginDto.username);
            if (!user) {
                throw new common_1.HttpException('Tên đăng nhập hoặc mật khẩu không đúng', common_1.HttpStatus.UNAUTHORIZED);
            }
            const isPasswordValid = await this.usersService.verifyPassword(loginDto.password, user.password);
            if (!isPasswordValid) {
                throw new common_1.HttpException('Tên đăng nhập hoặc mật khẩu không đúng', common_1.HttpStatus.UNAUTHORIZED);
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
                    birthday: user.birthday ? user.birthday.toString().split('T')[0] : '',
                    createdAt: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString(),
                    updatedAt: user.updatedAt ? user.updatedAt.toISOString() : new Date().toISOString()
                }
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Có lỗi xảy ra trong quá trình đăng nhập', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async testLogin(loginDto) {
        try {
            console.log('=== TEST LOGIN START ===');
            console.log('Username:', loginDto.username);
            console.log('Password:', loginDto.password);
            const user = await this.usersService.findByUsername(loginDto.username);
            console.log('User found:', !!user);
            if (!user) {
                return { error: 'User not found', username: loginDto.username };
            }
            console.log('User data:', {
                id: user.id,
                username: user.username,
                email: user.email,
                role_id: user.role_id,
                hasPassword: !!user.password,
                passwordLength: user.password ? user.password.length : 0
            });
            try {
                const isValid = await this.usersService.verifyPassword(loginDto.password, user.password);
                console.log('Password check result:', isValid);
                return {
                    success: true,
                    userFound: true,
                    passwordValid: isValid,
                    userData: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        role_id: user.role_id
                    }
                };
            }
            catch (passwordError) {
                console.error('Password verification error:', passwordError);
                return {
                    error: 'Password verification failed',
                    details: passwordError.message
                };
            }
        }
        catch (error) {
            console.error('Test login error:', error);
            return {
                error: 'Test failed',
                details: error.message,
                stack: error.stack
            };
        }
    }
    async simpleLogin(loginDto) {
        try {
            const user = await this.usersService.findByUsername(loginDto.username);
            if (!user) {
                return { error: 'User not found' };
            }
            const isValid = await this.usersService.verifyPassword(loginDto.password, user.password);
            return {
                success: isValid,
                user: isValid ? { id: user.id, username: user.username, role_id: user.role_id } : null
            };
        }
        catch (error) {
            return { error: error.message };
        }
    }
    async resetPassword(body) {
        try {
            const user = await this.usersService.findByUsername(body.username);
            if (!user) {
                throw new common_1.HttpException('User không tồn tại', common_1.HttpStatus.NOT_FOUND);
            }
            const hashedPassword = await this.usersService.hashPassword(body.newPassword);
            await this.usersService.updatePassword(user.id, hashedPassword);
            return { message: 'Mật khẩu đã được cập nhật thành công' };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Có lỗi xảy ra', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/password'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updatePassword", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('count/total'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "count", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('test-login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "testLogin", null);
__decorate([
    (0, common_1.Post)('simple-login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "simpleLogin", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "resetPassword", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map