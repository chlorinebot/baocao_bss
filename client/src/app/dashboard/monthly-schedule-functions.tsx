// Monthly Work Schedule Functions (Updated for new system)
import { useCallback } from 'react';
import { 
  apiService, 
  MonthlyWorkSchedule, 
  DailySchedule,
  CreateMonthlyScheduleData,
  UpdateMonthlyScheduleData,
  EmployeeRoles
} from '../lib/api';

export const useMonthlySchedule = (
  showToast: (message: string, type: 'success' | 'error' | 'info') => void
) => {
  // Fetch monthly schedules
  const fetchMonthlySchedules = useCallback(async () => {
    try {
      const response = await apiService.getMonthlySchedules();
      if (response.success && response.data) {
        return response.data;
      } else {
        showToast('Không thể tải danh sách phân công hàng tháng', 'error');
        return [];
      }
    } catch (error) {
      console.error('Error fetching monthly schedules:', error);
      showToast('Lỗi kết nối server', 'error');
      return [];
    }
  }, [showToast]);

  // Fetch specific monthly schedule
  const fetchMonthlySchedule = useCallback(async (month: number, year: number) => {
    try {
      const response = await apiService.getMonthlySchedule(month, year);
      if (response.success && response.data) {
        return response.data;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching monthly schedule:', error);
      return null;
    }
  }, []);

  // Generate automatic schedule
  const generateAutoSchedule = useCallback(async (month: number, year: number, createdBy: number) => {
    try {
      const response = await apiService.generateAutoSchedule(month, year, createdBy);
      if (response.success) {
        showToast('Tạo phân công tự động thành công!', 'success');
        return response.data;
      } else {
        showToast(response.error || 'Có lỗi xảy ra khi tạo phân công', 'error');
        return null;
      }
    } catch (error) {
      console.error('Error generating auto schedule:', error);
      showToast('Lỗi kết nối server', 'error');
      return null;
    }
  }, [showToast]);

  // Update monthly schedule
  const updateMonthlySchedule = useCallback(async (id: number, data: UpdateMonthlyScheduleData) => {
    try {
      const response = await apiService.updateMonthlySchedule(id, data);
      if (response.success) {
        showToast('Cập nhật ca làm việc thành công!', 'success');
        return response.data;
      } else {
        showToast(response.error || 'Có lỗi xảy ra khi cập nhật', 'error');
        return null;
      }
    } catch (error) {
      console.error('Error updating monthly schedule:', error);
      showToast('Lỗi kết nối server', 'error');
      return null;
    }
  }, [showToast]);

  // Delete monthly schedule
  const deleteMonthlySchedule = useCallback(async (id: number) => {
    try {
      const response = await apiService.deleteMonthlySchedule(id);
      if (response.success) {
        showToast('Xóa phân công thành công!', 'success');
        return true;
      } else {
        showToast(response.error || 'Có lỗi xảy ra khi xóa phân công', 'error');
        return false;
      }
    } catch (error) {
      console.error('Error deleting monthly schedule:', error);
      showToast('Lỗi kết nối server', 'error');
      return false;
    }
  }, [showToast]);

  // Get employee roles
  const getEmployeeRoles = useCallback(async () => {
    try {
      const response = await apiService.getEmployeeRoles();
      if (response.success && response.data) {
        return response.data;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching employee roles:', error);
      return null;
    }
  }, []);

  // Get days in month
  const getDaysInMonth = useCallback((month: number, year: number): number => {
    return new Date(year, month, 0).getDate();
  }, []);

  // Get shift name in Vietnamese
  const getShiftName = useCallback((shift: 'morning' | 'afternoon' | 'evening'): string => {
    switch (shift) {
      case 'morning': return 'Ca sáng';
      case 'afternoon': return 'Ca chiều';
      case 'evening': return 'Ca tối';
      default: return '';
    }
  }, []);

  return {
    fetchMonthlySchedules,
    fetchMonthlySchedule,
    generateAutoSchedule,
    updateMonthlySchedule,
    deleteMonthlySchedule,
    getEmployeeRoles,
    getDaysInMonth,
    getShiftName
  };
}; 