const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  birthday?: string;
}

interface LoginData {
  username: string;
  password: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  birthday?: string;
  isActive: boolean;
  role_id: number;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(url, config);
      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data,
        };
      } else {
        return {
          success: false,
          error: data.message || data.error || 'Có lỗi xảy ra',
          message: data.message || data.error || 'Có lỗi xảy ra',
        };
      }
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        error: 'Không thể kết nối tới server. Vui lòng kiểm tra kết nối mạng.',
      };
    }
  }

  // Đăng ký người dùng mới
  async register(data: RegisterData): Promise<ApiResponse<User>> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Đăng nhập (sẽ implement sau khi có authentication API)
  async login(data: LoginData): Promise<ApiResponse<User>> {
    // Tạm thời mock - sẽ update khi có auth API
    return this.request<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Lấy thông tin user theo email
  async getUserByEmail(email: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/email/${email}`);
  }

  // Lấy tất cả users
  async getUsers(): Promise<ApiResponse<User[]>> {
    return this.request<User[]>('/users');
  }

  // Lấy user theo ID
  async getUser(id: number): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${id}`);
  }

  // Cập nhật user
  async updateUser(id: number, data: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Xóa user
  async deleteUser(id: number): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/users/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
export type { RegisterData, LoginData, User, ApiResponse }; 