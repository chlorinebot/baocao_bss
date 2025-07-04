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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../entities/user.entity");
const bcrypt = require("bcrypt");
let UsersService = class UsersService {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async findAll() {
        return await this.userRepository.find();
    }
    async findOne(id) {
        return await this.userRepository.findOne({ where: { id } });
    }
    async findByEmail(email) {
        return await this.userRepository.findOne({ where: { email } });
    }
    async findByUsername(username) {
        return await this.userRepository.findOne({ where: { username } });
    }
    async create(userData) {
        if (!userData.username || !userData.email || !userData.password) {
            throw new common_1.BadRequestException('Tên đăng nhập, email và mật khẩu là bắt buộc');
        }
        if (!userData.firstName || !userData.lastName) {
            throw new common_1.BadRequestException('Họ và tên là bắt buộc');
        }
        const existingUserByUsername = await this.findByUsername(userData.username);
        if (existingUserByUsername) {
            throw new common_1.ConflictException('Tên đăng nhập đã tồn tại');
        }
        const existingUserByEmail = await this.findByEmail(userData.email);
        if (existingUserByEmail) {
            throw new common_1.ConflictException('Email đã được sử dụng');
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            throw new common_1.BadRequestException('Email không đúng định dạng');
        }
        if (userData.username.length < 3) {
            throw new common_1.BadRequestException('Tên đăng nhập phải có ít nhất 3 ký tự');
        }
        if (userData.username.includes(' ')) {
            throw new common_1.BadRequestException('Tên đăng nhập không được chứa khoảng trắng');
        }
        if (userData.password.length < 6) {
            throw new common_1.BadRequestException('Mật khẩu phải có ít nhất 6 ký tự');
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
        const user = this.userRepository.create({
            ...userData,
            password: hashedPassword,
            isActive: true,
            role_id: 2
        });
        return await this.userRepository.save(user);
    }
    async update(id, userData) {
        if (userData.password) {
            const saltRounds = 10;
            userData.password = await bcrypt.hash(userData.password, saltRounds);
        }
        await this.userRepository.update(id, userData);
        return await this.findOne(id);
    }
    async remove(id) {
        await this.userRepository.delete(id);
    }
    async count() {
        return await this.userRepository.count();
    }
    async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map