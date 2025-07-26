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

interface Server {
  id: number;
  server_name: string;
  ip: string;
}

interface CreateServerData {
  server_name: string;
  ip: string;
}

interface UpdateServerData {
  server_name?: string;
  ip?: string;
}

// Monthly Work Schedule Interfaces (using separate monthly_work_schedules table)
interface MonthlyWorkSchedule {
  id: number;
  month: number; // 1-12
  year: number;
  schedule_data: DailySchedule[];
  created_at: string;
  updated_at?: string;
  created_by: number;
  created_by_name?: string;
}

interface DailySchedule {
  date: number; // 1-31
  shifts: {
    morning: ShiftAssignment;
    afternoon: ShiftAssignment;
    evening: ShiftAssignment;
  };
}

interface ShiftAssignment {
  role: 'A' | 'B' | 'C' | 'D';
  employee_name: string;
}

interface CreateMonthlyScheduleData {
  month: number;
  year: number;
  created_by: number;
}

interface UpdateMonthlyScheduleData {
  schedule_data: DailySchedule[];
}

// Employee Roles from work_schedule
interface EmployeeRoles {
  employee_a: number;
  employee_b: number;
  employee_c: number;
  employee_d: number;
  employee_a_name: string;
  employee_b_name: string;
  employee_c_name: string;
  employee_d_name: string;
  created_date: string;
  activation_date: string;
}

interface ApiResponse<T = unknown> {
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

  // === SERVER MANAGEMENT APIs ===

  // Lấy tất cả máy chủ
  async getServers(): Promise<ApiResponse<Server[]>> {
    return this.request<Server[]>('/servers');
  }

  // Lấy máy chủ theo ID
  async getServer(id: number): Promise<ApiResponse<Server>> {
    return this.request<Server>(`/servers/${id}`);
  }

  // Tạo máy chủ mới
  async createServer(data: CreateServerData): Promise<ApiResponse<Server>> {
    return this.request<Server>('/servers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Cập nhật máy chủ
  async updateServer(id: number, data: UpdateServerData): Promise<ApiResponse<Server>> {
    return this.request<Server>(`/servers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Xóa máy chủ
  async deleteServer(id: number): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return this.request<{ success: boolean; message: string }>(`/servers/${id}`, {
      method: 'DELETE',
    });
  }

  // Đếm tổng số máy chủ
  async getServersCount(): Promise<ApiResponse<{ count: number }>> {
    return this.request<{ count: number }>('/servers/count/total');
  }

  // === MONTHLY WORK SCHEDULE APIs (New System) ===

  // Lấy tất cả phân công hàng tháng
  async getMonthlySchedules(): Promise<ApiResponse<MonthlyWorkSchedule[]>> {
    return this.request<MonthlyWorkSchedule[]>('/monthly-schedules');
  }

  // Lấy phân công theo tháng/năm
  async getMonthlySchedule(month: number, year: number): Promise<ApiResponse<MonthlyWorkSchedule>> {
    console.log('🌐 [API] getMonthlySchedule called');
    console.log('📋 [API] Parameters:', { month, year });
    
    try {
      console.log('🔗 [API] Making GET request to /monthly-schedules/' + year + '/' + month);
      const response = await fetch(`${API_BASE_URL}/monthly-schedules/${year}/${month}`);
      
      console.log('📡 [API] Response status:', response.status);
      
      if (!response.ok) {
        console.error('❌ [API] HTTP error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ [API] Response data:', result);
      
      // Kiểm tra và đảm bảo schedule_data là array
      if (result.success && result.data) {
        console.log('🔍 [API] Checking schedule_data format...');
        
        if (typeof result.data.schedule_data === 'string') {
          try {
            console.log('🔧 [API] Parsing schedule_data from string...');
            result.data.schedule_data = JSON.parse(result.data.schedule_data);
            console.log('✅ [API] Successfully parsed schedule_data');
          } catch (error) {
            console.error('❌ [API] Error parsing schedule_data:', error);
            result.data.schedule_data = [];
          }
        }
        
        if (!Array.isArray(result.data.schedule_data)) {
          console.error('❌ [API] schedule_data is not an array, setting empty array');
          result.data.schedule_data = [];
        }
      }
      
      return result;
    } catch (error) {
      console.error('❌ [API] Exception in getMonthlySchedule:', error);
      return {
        success: false,
        error: (error as Error).message || 'Network error'
      };
    }
  }

  // Tạo phân công hàng tháng mới dựa trên vai trò A,B,C,D
  async createMonthlySchedule(data: CreateMonthlyScheduleData): Promise<ApiResponse<MonthlyWorkSchedule>> {
    return this.request<MonthlyWorkSchedule>('/monthly-schedules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Cập nhật phân công hàng tháng
  async updateMonthlySchedule(id: number, data: UpdateMonthlyScheduleData): Promise<ApiResponse<MonthlyWorkSchedule>> {
    return this.request<MonthlyWorkSchedule>(`/monthly-schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Xóa phân công hàng tháng
  async deleteMonthlySchedule(id: number): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return this.request<{ success: boolean; message: string }>(`/monthly-schedules/${id}`, {
      method: 'DELETE',
    });
  }

  // Lấy vai trò nhân viên hiện tại từ work_schedule
  async getEmployeeRoles(): Promise<ApiResponse<EmployeeRoles>> {
    return this.request<EmployeeRoles>('/work-schedule/roles');
  }

  // Tạo phân công tự động cho tháng dựa trên vai trò A,B,C,D
  async generateAutoSchedule(month: number, year: number, createdBy: number, startingRole?: 'A' | 'B' | 'C' | 'D'): Promise<ApiResponse<MonthlyWorkSchedule>> {
    console.log('🌐 [API] generateAutoSchedule called');
    console.log('📋 [API] Parameters:', { month, year, createdBy, startingRole });
    
    try {
      const requestBody = {
        month,
        year,
        created_by: createdBy,
        starting_role: startingRole
      };
      console.log('📤 [API] Request body:', requestBody);
      console.log('🔗 [API] Making POST request to /monthly-schedules/auto-generate');
      
      const response = await fetch(`${API_BASE_URL}/monthly-schedules/auto-generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📡 [API] Response status:', response.status);
      console.log('📡 [API] Response headers:', response.headers);
      
      if (!response.ok) {
        console.error('❌ [API] HTTP error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ [API] Response data:', result);
      return result;
    } catch (error) {
      console.error('❌ [API] Exception in generateAutoSchedule:', error);
      return {
        success: false,
        error: (error as Error).message || 'Network error'
      };
    }
  }
}

export const apiService = new ApiService();
export type { 
  RegisterData, 
  LoginData, 
  User, 
  Server, 
  CreateServerData, 
  UpdateServerData, 
  ApiResponse,
  MonthlyWorkSchedule,
  DailySchedule,
  ShiftAssignment,
  CreateMonthlyScheduleData,
  UpdateMonthlyScheduleData,
  EmployeeRoles
}; 