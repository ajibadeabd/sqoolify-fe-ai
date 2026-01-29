import { api } from './api';
import { getStoredToken } from './auth-context';
import {
  ApiResponse, User, UpdateProfileData, ChangePasswordData,
  School, Student, CreateStudentData, Teacher, CreateTeacherData,
  Parent, CreateParentData, SchoolClass, CreateClassData, Subject, CreateSubjectData,
  Session, CreateSessionData, Exam, CreateExamData, Score, CreateScoreData,
  ReportCard, Attendance, CreateAttendanceData, AttendanceSummary,
  Bank, CreateBankData, Notice, CreateNoticeData, Plan, Subscription,
  SubscriptionHistory, Fee, CreateFeeData, StudentFee, Payment, CreatePaymentData,
  ExamResult, CreateExamResultData, AssessmentConfig, AppConfig, ConfigSettings,
  DashboardStats, UploadResponse
} from './types';

// Helper to get auth options
export const authOptions = () => ({ token: getStoredToken() || undefined });

// Re-export api for convenience
export { api };

// Query params helper
const buildQuery = (params: Record<string, any>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });
  return query.toString() ? `?${query.toString()}` : '';
};

// ============ AUTH ============
export const authService = {
  sendOtp: (phone: string) =>
    api.post<ApiResponse<{ message: string }>>('/auth/send-otp', { phone }),

  verifyOtp: (phone: string, otp: string) =>
    api.post<ApiResponse<{ verified: boolean }>>('/auth/verify-otp', { phone, otp }),

  forgotPassword: (email: string) =>
    api.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email }),

  resetPassword: (email: string, otp: string, newPassword: string) =>
    api.post<ApiResponse<{ message: string }>>('/auth/reset-password', { email, otp, newPassword }),

  getProfile: () =>
    api.get<ApiResponse<User>>('/auth/me', authOptions()),
};

// ============ USERS ============
export const userService = {
  getProfile: () =>
    api.get<ApiResponse<User>>('/users/profile', authOptions()),

  updateProfile: (data: UpdateProfileData) =>
    api.patch<ApiResponse<User>>('/users/profile', data, authOptions()),

  changePassword: (data: ChangePasswordData) =>
    api.patch<ApiResponse<{ message: string }>>('/users/change-password', data, authOptions()),
};

// ============ SCHOOLS ============
export const schoolService = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<ApiResponse<School[]>>(`/schools${buildQuery(params || {})}`, authOptions()),

  getById: (id: string) =>
    api.get<ApiResponse<School>>(`/schools/${id}`, authOptions()),

  create: (data: Partial<School>) =>
    api.post<ApiResponse<School>>('/schools', data, authOptions()),

  update: (id: string, data: Partial<School>) =>
    api.patch<ApiResponse<School>>(`/schools/${id}`, data, authOptions()),

  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/schools/${id}`, authOptions()),
};

// ============ STUDENTS ============
export const studentService = {
  getAll: (params?: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: string }) =>
    api.get<ApiResponse<Student[]>>(`/students${buildQuery(params || {})}`, authOptions()),

  getById: (id: string) =>
    api.get<ApiResponse<Student>>(`/students/${id}`, authOptions()),

  create: (data: CreateStudentData) =>
    api.post<ApiResponse<Student>>('/students', data, authOptions()),

  update: (id: string, data: Partial<CreateStudentData>) =>
    api.patch<ApiResponse<Student>>(`/students/${id}`, data, authOptions()),

  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/students/${id}`, authOptions()),

  assignParent: (studentId: string, parentId: string) =>
    api.patch<ApiResponse<Student>>(`/students/${studentId}/assign-parent`, { parentId }, authOptions()),

  assignClass: (studentId: string, classId: string) =>
    api.patch<ApiResponse<Student>>(`/students/${studentId}/assign-class`, { classId }, authOptions()),
};

// ============ TEACHERS ============
export const teacherService = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<ApiResponse<Teacher[]>>(`/teachers${buildQuery(params || {})}`, authOptions()),

  getById: (id: string) =>
    api.get<ApiResponse<Teacher>>(`/teachers/${id}`, authOptions()),

  create: (data: CreateTeacherData) =>
    api.post<ApiResponse<Teacher>>('/teachers', data, authOptions()),

  update: (id: string, data: Partial<CreateTeacherData>) =>
    api.patch<ApiResponse<Teacher>>(`/teachers/${id}`, data, authOptions()),

  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/teachers/${id}`, authOptions()),

  assignClass: (teacherId: string, classId: string) =>
    api.patch<ApiResponse<Teacher>>(`/teachers/${teacherId}/assign-class`, { classId }, authOptions()),

  assignSubject: (teacherId: string, subjectId: string) =>
    api.patch<ApiResponse<Teacher>>(`/teachers/${teacherId}/assign-subject`, { subjectId }, authOptions()),
};

// ============ PARENTS ============
export const parentService = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<ApiResponse<Parent[]>>(`/parents${buildQuery(params || {})}`, authOptions()),

  getById: (id: string) =>
    api.get<ApiResponse<Parent>>(`/parents/${id}`, authOptions()),

  create: (data: CreateParentData) =>
    api.post<ApiResponse<Parent>>('/parents', data, authOptions()),

  update: (id: string, data: Partial<CreateParentData>) =>
    api.patch<ApiResponse<Parent>>(`/parents/${id}`, data, authOptions()),

  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/parents/${id}`, authOptions()),

  getChildren: (parentId: string) =>
    api.get<ApiResponse<Student[]>>(`/parents/${parentId}/children`, authOptions()),
};

// ============ CLASSES ============
export const classService = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<ApiResponse<SchoolClass[]>>(`/classes${buildQuery(params || {})}`, authOptions()),

  getById: (id: string) =>
    api.get<ApiResponse<SchoolClass>>(`/classes/${id}`, authOptions()),

  create: (data: CreateClassData) =>
    api.post<ApiResponse<SchoolClass>>('/classes', data, authOptions()),

  update: (id: string, data: Partial<CreateClassData>) =>
    api.patch<ApiResponse<SchoolClass>>(`/classes/${id}`, data, authOptions()),

  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/classes/${id}`, authOptions()),

  assignTeacher: (classId: string, teacherId: string) =>
    api.patch<ApiResponse<SchoolClass>>(`/classes/${classId}/assign-teacher`, { teacherId }, authOptions()),

  getStudents: (classId: string) =>
    api.get<ApiResponse<Student[]>>(`/classes/${classId}/students`, authOptions()),
};

// ============ SUBJECTS ============
export const subjectService = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<ApiResponse<Subject[]>>(`/subjects${buildQuery(params || {})}`, authOptions()),

  getById: (id: string) =>
    api.get<ApiResponse<Subject>>(`/subjects/${id}`, authOptions()),

  create: (data: CreateSubjectData) =>
    api.post<ApiResponse<Subject>>('/subjects', data, authOptions()),

  update: (id: string, data: Partial<CreateSubjectData>) =>
    api.patch<ApiResponse<Subject>>(`/subjects/${id}`, data, authOptions()),

  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/subjects/${id}`, authOptions()),

  assignTeacher: (subjectId: string, teacherId: string) =>
    api.patch<ApiResponse<Subject>>(`/subjects/${subjectId}/assign-teacher`, { teacherId }, authOptions()),

  assignClass: (subjectId: string, classId: string) =>
    api.patch<ApiResponse<Subject>>(`/subjects/${subjectId}/assign-class`, { classId }, authOptions()),
};

// ============ SESSIONS ============
export const sessionService = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<Session[]>>(`/sessions${buildQuery(params || {})}`, authOptions()),

  getById: (id: string) =>
    api.get<ApiResponse<Session>>(`/sessions/${id}`, authOptions()),

  getCurrent: () =>
    api.get<ApiResponse<Session>>('/sessions/current', authOptions()),

  create: (data: CreateSessionData) =>
    api.post<ApiResponse<Session>>('/sessions', data, authOptions()),

  update: (id: string, data: Partial<CreateSessionData>) =>
    api.patch<ApiResponse<Session>>(`/sessions/${id}`, data, authOptions()),

  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/sessions/${id}`, authOptions()),

  setCurrent: (id: string) =>
    api.patch<ApiResponse<Session>>(`/sessions/${id}/set-current`, {}, authOptions()),
};

// ============ EXAMS ============
export const examService = {
  getAll: (params?: { page?: number; limit?: number; classId?: string; subjectId?: string; sessionId?: string; term?: string }) =>
    api.get<ApiResponse<Exam[]>>(`/exams${buildQuery(params || {})}`, authOptions()),

  getById: (id: string) =>
    api.get<ApiResponse<Exam>>(`/exams/${id}`, authOptions()),

  create: (data: CreateExamData) =>
    api.post<ApiResponse<Exam>>('/exams', data, authOptions()),

  update: (id: string, data: Partial<CreateExamData>) =>
    api.patch<ApiResponse<Exam>>(`/exams/${id}`, data, authOptions()),

  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/exams/${id}`, authOptions()),
};

// ============ SCORES ============
export const scoreService = {
  getAll: (params?: { examId?: string; studentId?: string; subjectId?: string }) =>
    api.get<ApiResponse<Score[]>>(`/scores${buildQuery(params || {})}`, authOptions()),

  getById: (id: string) =>
    api.get<ApiResponse<Score>>(`/scores/${id}`, authOptions()),

  create: (data: CreateScoreData) =>
    api.post<ApiResponse<Score>>('/scores', data, authOptions()),

  update: (id: string, data: Partial<CreateScoreData>) =>
    api.patch<ApiResponse<Score>>(`/scores/${id}`, data, authOptions()),

  submitBulk: (scores: CreateScoreData[]) =>
    api.post<ApiResponse<Score[]>>('/scores/bulk', { scores }, authOptions()),
};

// ============ REPORT CARDS ============
export const reportCardService = {
  getAll: (params?: { page?: number; limit?: number; studentId?: string; sessionId?: string; term?: string }) =>
    api.get<ApiResponse<ReportCard[]>>(`/report-cards${buildQuery(params || {})}`, authOptions()),

  getById: (id: string) =>
    api.get<ApiResponse<ReportCard>>(`/report-cards/${id}`, authOptions()),

  generate: (studentId: string, sessionId: string, term: string) =>
    api.post<ApiResponse<ReportCard>>('/report-cards/generate', { studentId, sessionId, term }, authOptions()),

  update: (id: string, data: { teacherRemark?: string; principalRemark?: string }) =>
    api.patch<ApiResponse<ReportCard>>(`/report-cards/${id}`, data, authOptions()),

  downloadPdf: (id: string) =>
    api.get<Blob>(`/report-cards/${id}/pdf`, authOptions()),
};

// ============ ATTENDANCE ============
export const attendanceService = {
  getAll: (params?: { page?: number; limit?: number; classId?: string; startDate?: string; endDate?: string }) =>
    api.get<ApiResponse<Attendance[]>>(`/attendance${buildQuery(params || {})}`, authOptions()),

  getById: (id: string) =>
    api.get<ApiResponse<Attendance>>(`/attendance/${id}`, authOptions()),

  create: (data: CreateAttendanceData) =>
    api.post<ApiResponse<Attendance>>('/attendance', data, authOptions()),

  update: (id: string, data: Partial<CreateAttendanceData>) =>
    api.patch<ApiResponse<Attendance>>(`/attendance/${id}`, data, authOptions()),

  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/attendance/${id}`, authOptions()),

  getSummary: (classId: string, params?: { startDate?: string; endDate?: string }) =>
    api.get<ApiResponse<AttendanceSummary[]>>(`/attendance/summary/${classId}${buildQuery(params || {})}`, authOptions()),
};

// ============ BANKS ============
export const bankService = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<Bank[]>>(`/banks${buildQuery(params || {})}`, authOptions()),

  getById: (id: string) =>
    api.get<ApiResponse<Bank>>(`/banks/${id}`, authOptions()),

  create: (data: CreateBankData) =>
    api.post<ApiResponse<Bank>>('/banks', data, authOptions()),

  update: (id: string, data: Partial<CreateBankData>) =>
    api.patch<ApiResponse<Bank>>(`/banks/${id}`, data, authOptions()),

  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/banks/${id}`, authOptions()),
};

// ============ NOTICE BOARD ============
export const noticeService = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<ApiResponse<Notice[]>>(`/notices${buildQuery(params || {})}`, authOptions()),

  getById: (id: string) =>
    api.get<ApiResponse<Notice>>(`/notices/${id}`, authOptions()),

  create: (data: CreateNoticeData) =>
    api.post<ApiResponse<Notice>>('/notices', data, authOptions()),

  update: (id: string, data: Partial<CreateNoticeData>) =>
    api.patch<ApiResponse<Notice>>(`/notices/${id}`, data, authOptions()),

  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/notices/${id}`, authOptions()),

  togglePin: (id: string) =>
    api.patch<ApiResponse<Notice>>(`/notices/${id}/toggle-pin`, {}, authOptions()),
};

// ============ FILE STORAGE ============
export const fileService = {
  upload: async (file: File): Promise<ApiResponse<UploadResponse>> => {
    const formData = new FormData();
    formData.append('file', file);
    const token = getStoredToken();
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'}/storage/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },

  delete: (publicId: string) =>
    api.delete<ApiResponse<void>>(`/storage/${publicId}`, authOptions()),
};

// ============ PLANS ============
export const planService = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<Plan[]>>(`/plans${buildQuery(params || {})}`, authOptions()),

  getById: (id: string) =>
    api.get<ApiResponse<Plan>>(`/plans/${id}`, authOptions()),

  create: (data: Partial<Plan>) =>
    api.post<ApiResponse<Plan>>('/plans', data, authOptions()),

  update: (id: string, data: Partial<Plan>) =>
    api.patch<ApiResponse<Plan>>(`/plans/${id}`, data, authOptions()),

  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/plans/${id}`, authOptions()),
};

// ============ SUBSCRIPTIONS ============
export const subscriptionService = {
  getCurrent: () =>
    api.get<ApiResponse<Subscription>>('/subscriptions/current', authOptions()),

  subscribe: (planId: string, autoRenew?: boolean) =>
    api.post<ApiResponse<Subscription>>('/subscriptions', { planId, autoRenew }, authOptions()),

  cancel: () =>
    api.post<ApiResponse<Subscription>>('/subscriptions/cancel', {}, authOptions()),

  renew: (planId?: string) =>
    api.post<ApiResponse<Subscription>>('/subscriptions/renew', { planId }, authOptions()),

  getHistory: () =>
    api.get<ApiResponse<SubscriptionHistory[]>>('/subscriptions/history', authOptions()),
};

// ============ FEES ============
export const feeService = {
  getAll: (params?: { page?: number; limit?: number; classId?: string; sessionId?: string }) =>
    api.get<ApiResponse<Fee[]>>(`/fees${buildQuery(params || {})}`, authOptions()),

  getById: (id: string) =>
    api.get<ApiResponse<Fee>>(`/fees/${id}`, authOptions()),

  create: (data: CreateFeeData) =>
    api.post<ApiResponse<Fee>>('/fees', data, authOptions()),

  update: (id: string, data: Partial<CreateFeeData>) =>
    api.patch<ApiResponse<Fee>>(`/fees/${id}`, data, authOptions()),

  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/fees/${id}`, authOptions()),

  assignToStudent: (feeId: string, studentId: string) =>
    api.post<ApiResponse<StudentFee>>('/fees/assign', { feeId, studentId }, authOptions()),

  getStudentFees: (params?: { studentId?: string; status?: string }) =>
    api.get<ApiResponse<StudentFee[]>>(`/fees/student-fees${buildQuery(params || {})}`, authOptions()),

  getSummary: () =>
    api.get<ApiResponse<{ totalCollected: number; totalOutstanding: number }>>('/fees/summary', authOptions()),
};

// ============ PAYMENTS ============
export const paymentService = {
  getAll: (params?: { page?: number; limit?: number; studentId?: string; status?: string }) =>
    api.get<ApiResponse<Payment[]>>(`/payments${buildQuery(params || {})}`, authOptions()),

  getById: (id: string) =>
    api.get<ApiResponse<Payment>>(`/payments/${id}`, authOptions()),

  create: (data: CreatePaymentData) =>
    api.post<ApiResponse<Payment>>('/payments', data, authOptions()),

  getSummary: (params?: { sessionId?: string; term?: number }) =>
    api.get<ApiResponse<{ totalPayments: number; totalAmount: number }>>(`/payments/summary${buildQuery(params || {})}`, authOptions()),
};

// ============ EXAM RESULTS ============
export const examResultService = {
  getAll: (params?: { page?: number; limit?: number; studentId?: string; subjectId?: string; classId?: string; sessionId?: string; term?: number }) =>
    api.get<ApiResponse<ExamResult[]>>(`/exam-results${buildQuery(params || {})}`, authOptions()),

  getById: (id: string) =>
    api.get<ApiResponse<ExamResult>>(`/exam-results/${id}`, authOptions()),

  create: (data: CreateExamResultData) =>
    api.post<ApiResponse<ExamResult>>('/exam-results', data, authOptions()),

  createBulk: (results: CreateExamResultData[]) =>
    api.post<ApiResponse<ExamResult[]>>('/exam-results/bulk', { results }, authOptions()),

  update: (id: string, data: Partial<CreateExamResultData>) =>
    api.patch<ApiResponse<ExamResult>>(`/exam-results/${id}`, data, authOptions()),

  getRanking: (classId: string, sessionId: string, term: number) =>
    api.get<ApiResponse<any[]>>(`/exam-results/ranking?classId=${classId}&sessionId=${sessionId}&term=${term}`, authOptions()),

  getAssessmentConfig: () =>
    api.get<ApiResponse<AssessmentConfig>>('/exam-results/assessment-config', authOptions()),

  updateAssessmentConfig: (data: Partial<AssessmentConfig>) =>
    api.post<ApiResponse<AssessmentConfig>>('/exam-results/assessment-config', data, authOptions()),
};

// ============ DASHBOARD ============
export const dashboardService = {
  getStats: () =>
    api.get<ApiResponse<DashboardStats>>('/dashboard/stats', authOptions()),
};

// ============ APP CONFIG ============
export const configService = {
  get: () =>
    api.get<ApiResponse<AppConfig>>('/config', authOptions()),

  update: (settings: Partial<ConfigSettings>) =>
    api.patch<ApiResponse<AppConfig>>('/config', { settings }, authOptions()),
};
