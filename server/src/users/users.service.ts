import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOne(id: number): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { username } });
  }

  async create(userData: Partial<User>): Promise<User> {
    // Validation
    if (!userData.username || !userData.email || !userData.password) {
      throw new BadRequestException('Tên đăng nhập, email và mật khẩu là bắt buộc');
    }

    if (!userData.firstName || !userData.lastName) {
      throw new BadRequestException('Họ và tên là bắt buộc');
    }

    // Check if username or email already exists
    const existingUserByUsername = await this.findByUsername(userData.username);
    if (existingUserByUsername) {
      throw new ConflictException('Tên đăng nhập đã tồn tại');
    }

    const existingUserByEmail = await this.findByEmail(userData.email);
    if (existingUserByEmail) {
      throw new ConflictException('Email đã được sử dụng');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new BadRequestException('Email không đúng định dạng');
    }

    // Validate username
    if (userData.username.length < 3) {
      throw new BadRequestException('Tên đăng nhập phải có ít nhất 3 ký tự');
    }
    if (userData.username.includes(' ')) {
      throw new BadRequestException('Tên đăng nhập không được chứa khoảng trắng');
    }

    // Validate password
    if (userData.password.length < 6) {
      throw new BadRequestException('Mật khẩu phải có ít nhất 6 ký tự');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // Create user with hashed password and default role_id = 2 (user thông thường)
    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
      isActive: true,
      role_id: 2 // Mặc định là user thông thường
    });

    return await this.userRepository.save(user);
  }

  async update(id: number, userData: Partial<User>): Promise<User | null> {
    // If password is being updated, hash it
    if (userData.password) {
      const saltRounds = 10;
      userData.password = await bcrypt.hash(userData.password, saltRounds);
    }

    await this.userRepository.update(id, userData);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async count(): Promise<number> {
    return await this.userRepository.count();
  }

  // Method to verify password
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
} 