import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    // Kiểm tra format token đơn giản: token_userId_timestamp
    if (!token.startsWith('token_')) {
      throw new UnauthorizedException('Invalid token format');
    }

    try {
      const parts = token.split('_');
      if (parts.length !== 3) {
        throw new UnauthorizedException('Invalid token format');
      }

      const userId = parseInt(parts[1]);
      const timestamp = parseInt(parts[2]);

      if (isNaN(userId) || isNaN(timestamp)) {
        throw new UnauthorizedException('Invalid token format');
      }

      // Kiểm tra token còn hiệu lực (24 giờ)
      const tokenAge = Date.now() - timestamp;
      const maxAge = 24 * 60 * 60 * 1000; // 24 giờ
      
      if (tokenAge > maxAge) {
        throw new UnauthorizedException('Token expired');
      }

      // Gán user vào request
      request.user = { userId };
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
} 