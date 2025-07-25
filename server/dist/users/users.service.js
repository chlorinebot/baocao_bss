"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const bcrypt = __importStar(require("bcrypt"));
const common_2 = require("@nestjs/common");
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
            throw new common_2.BadRequestException('Tên đăng nhập, email và mật khẩu là bắt buộc');
        }
        if (!userData.firstName || !userData.lastName) {
            throw new common_2.BadRequestException('Họ và tên là bắt buộc');
        }
        const existingUserByUsername = await this.findByUsername(userData.username);
        if (existingUserByUsername) {
            throw new common_2.ConflictException('Tên đăng nhập đã tồn tại');
        }
        const existingUserByEmail = await this.findByEmail(userData.email);
        if (existingUserByEmail) {
            throw new common_2.ConflictException('Email đã được sử dụng');
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            throw new common_2.BadRequestException('Email không đúng định dạng');
        }
        if (userData.username.length < 3) {
            throw new common_2.BadRequestException('Tên đăng nhập phải có ít nhất 3 ký tự');
        }
        if (userData.username.includes(' ')) {
            throw new common_2.BadRequestException('Tên đăng nhập không được chứa khoảng trắng');
        }
        if (userData.password.length < 6) {
            throw new common_2.BadRequestException('Mật khẩu phải có ít nhất 6 ký tự');
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
        if (userData.username) {
            throw new common_2.BadRequestException('Không thể thay đổi tên đăng nhập');
        }
        if (userData.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(userData.email)) {
                throw new common_2.BadRequestException('Email không đúng định dạng');
            }
            const existingUserByEmail = await this.userRepository.findOne({
                where: { email: userData.email }
            });
            if (existingUserByEmail && existingUserByEmail.id !== id) {
                throw new common_2.ConflictException('Email đã được sử dụng');
            }
        }
        if (userData.firstName && userData.firstName.trim().length === 0) {
            throw new common_2.BadRequestException('Họ không được để trống');
        }
        if (userData.lastName && userData.lastName.trim().length === 0) {
            throw new common_2.BadRequestException('Tên không được để trống');
        }
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
    async hashPassword(password) {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    }
    async updatePassword(id, hashedPassword) {
        await this.userRepository.update(id, { password: hashedPassword });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map