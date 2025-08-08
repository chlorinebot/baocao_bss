import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World! Đây là server của BSS Team từ NestJS!';
  }
}
