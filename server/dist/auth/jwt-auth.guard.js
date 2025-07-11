"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
let JwtAuthGuard = class JwtAuthGuard {
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new common_1.UnauthorizedException('Token not found');
        }
        if (!token.startsWith('token_')) {
            throw new common_1.UnauthorizedException('Invalid token format');
        }
        try {
            const parts = token.split('_');
            if (parts.length !== 3) {
                throw new common_1.UnauthorizedException('Invalid token format');
            }
            const userId = parseInt(parts[1]);
            const timestamp = parseInt(parts[2]);
            if (isNaN(userId) || isNaN(timestamp)) {
                throw new common_1.UnauthorizedException('Invalid token format');
            }
            const tokenAge = Date.now() - timestamp;
            const maxAge = 24 * 60 * 60 * 1000;
            if (tokenAge > maxAge) {
                throw new common_1.UnauthorizedException('Token expired');
            }
            request.user = { userId };
            return true;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
    extractTokenFromHeader(request) {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)()
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map