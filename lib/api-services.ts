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
  DashboardStats, UploadResponse,
  Question, CreateQuestionData, StudentAnswer, ExamAttempt, ExamAttachment,
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

  resetPassword: (token: string, newPassword: string) =>
    api.post<ApiResponse<{ message: string }>>('/auth/reset-password', { token, newPassword }),

  getProfile: () =>
    api.get<ApiResponse<User>>('/auth/me', authOptions()),

  // Admin registration endpoints
  registerParent: (data: any) =>
    api.post<ApiResponse<Parent>>('/auth/register-parent', data, authOptions()),

  registerStudent: (data: any) =>
    api.post<ApiResponse<Student>>('/auth/register-student', data, authOptions()),

  registerTeacher: (data: any) =>
    api.post<ApiResponse<Teacher>>('/auth/register-teacher', data, authOptions()),

  bulkRegisterStudents: (students: any[]) =>
    api.post<ApiResponse<{ successCount: number; failureCount: number; errors: string[] }>>('/auth/bulk-register-students', { students }, authOptions()),

  bulkRegisterTeachers: (teachers: any[]) =>
    api.post<ApiResponse<{ successCount: number; failureCount: number; errors: string[] }>>('/auth/bulk-register-teachers', { teachers }, authOptions()),

  bulkRegisterParents: (parents: any[]) =>
    api.post<ApiResponse<{ successCount: number; failureCount: number; errors: string[] }>>('/auth/bulk-register-parents', { parents }, authOptions()),
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
  getAll: (params?: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: string; classId?: string; unassigned?: boolean }) =>
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

  bulkAssignClass: (studentIds: string[], classId: string) =>
    api.post<ApiResponse<{ success: number; failed: number }>>('/students/bulk-assign-class', { studentIds, classId }, authOptions()),

  bulkRemoveClass: (studentIds: string[]) =>
    api.post<ApiResponse<{ success: number; failed: number }>>('/students/bulk-remove-class', { studentIds }, authOptions()),

  getMyReportCard: () =>
    api.get<ApiResponse<any>>('/students/my-report-card', authOptions()),

  getMyResults: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<ApiResponse<any[]>>(`/students/my-results${buildQuery(params || {})}`, authOptions()),

  getMyAttendance: (params?: { page?: number; limit?: number; startDate?: string; endDate?: string }) =>
    api.get<ApiResponse<any>>(`/students/my-attendance${buildQuery(params || {})}`, authOptions()),

  getMyExams: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<ApiResponse<any[]>>(`/students/my-exams${buildQuery(params || {})}`, authOptions()),

  getMyFees: () =>
    api.get<ApiResponse<any[]>>('/students/my-fees', authOptions()),
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
    api.post<ApiResponse<Teacher>>(`/teachers/${teacherId}/assign-class/${classId}`, {}, authOptions()),

  assignSubject: (teacherId: string, subjectId: string) =>
    api.post<ApiResponse<Teacher>>(`/teachers/${teacherId}/assign-subject/${subjectId}`, {}, authOptions()),

  getMyClasses: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<ApiResponse<SchoolClass[]>>(`/teachers/my-classes${buildQuery(params || {})}`, authOptions()),

  getMySubjects: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<ApiResponse<Subject[]>>(`/teachers/my-subjects${buildQuery(params || {})}`, authOptions()),
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

  getMyChildren: () =>
    api.get<ApiResponse<Student[]>>('/parents/my-children', authOptions()),

  getMyChildById: (childId: string) =>
    api.get<ApiResponse<any>>(`/parents/my-children/${childId}`, authOptions()),

  getMyChildReportCard: (childId: string) =>
    api.get<ApiResponse<any>>(`/parents/my-children/${childId}/report-card`, authOptions()),

  downloadChildReportCardPdf: async (childId: string, reportCardId: string) => {
    const API_URL = import.meta.env.VITE_API_URL;
    const token = getStoredToken() || '';
    const response = await fetch(`${API_URL}/parents/my-children/${childId}/report-card/${reportCardId}/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to download PDF');
    return response.blob();
  },
};

// ============ CLASSES ============
export const classService = {
  getAll: (params?: { page?: number; limit?: number; search?: string; sessionId?: string }) =>
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
    api.post<ApiResponse<SchoolClass>>(`/classes/${classId}/assign-teacher/${teacherId}`, {}, authOptions()),

  getStudents: (classId: string) =>
    api.get<ApiResponse<Student[]>>(`/classes/${classId}/students`, authOptions()),

  bulkImport: (classes: any[]) =>
    api.post<ApiResponse<{ successCount: number; failureCount: number; errors: string[] }>>('/classes/bulk-import', { classes }, authOptions()),
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
    api.post<ApiResponse<Subject>>(`/subjects/${subjectId}/assign-teacher/${teacherId}`, {}, authOptions()),

  removeTeacher: (subjectId: string, teacherId: string) =>
    api.post<ApiResponse<Subject>>(`/subjects/${subjectId}/remove-teacher/${teacherId}`, {}, authOptions()),

  assignClass: (subjectId: string, classId: string, teacherIds?: string[]) =>
    api.post<ApiResponse<Subject>>(`/subjects/${subjectId}/assign-class/${classId}`, { teacherIds }, authOptions()),

  removeClass: (subjectId: string, classId: string) =>
    api.post<ApiResponse<Subject>>(`/subjects/${subjectId}/remove-class/${classId}`, {}, authOptions()),

  bulkImport: (subjects: any[]) =>
    api.post<ApiResponse<{ successCount: number; failureCount: number; errors: string[] }>>('/subjects/bulk-import', { subjects }, authOptions()),
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

  getMyExams: (params?: { limit?: number }) =>
    api.get<ApiResponse<Exam[]>>(`/teachers/my-exams${buildQuery(params || {})}`, authOptions()),

  getScores: (examId: string) =>
    api.get<ApiResponse<Score[]>>(`/exams/${examId}/scores`, authOptions()),

  submitScores: (examId: string, scores: { student: string; score: number }[]) =>
    api.post<ApiResponse<any>>(`/exams/${examId}/scores`, { scores }, authOptions()),

  // Question management (CBT)
  getQuestions: (examId: string) =>
    api.get<ApiResponse<Question[]>>(`/exams/${examId}/questions`, authOptions()),

  createQuestion: (examId: string, data: CreateQuestionData) =>
    api.post<ApiResponse<Question>>(`/exams/${examId}/questions`, data, authOptions()),

  updateQuestion: (examId: string, questionId: string, data: Partial<CreateQuestionData>) =>
    api.patch<ApiResponse<Question>>(`/exams/${examId}/questions/${questionId}`, data, authOptions()),

  deleteQuestion: (examId: string, questionId: string) =>
    api.delete<ApiResponse<void>>(`/exams/${examId}/questions/${questionId}`, authOptions()),

  bulkCreateQuestions: (examId: string, questions: CreateQuestionData[]) =>
    api.post<ApiResponse<{ successCount: number; failureCount: number; errors: string[] }>>(`/exams/${examId}/questions/bulk`, { questions }, authOptions()),

  reorderQuestions: (examId: string, questionIds: string[]) =>
    api.patch<ApiResponse<void>>(`/exams/${examId}/questions/reorder`, { questionIds }, authOptions()),

  submitForApproval: (examId: string) =>
    api.post<ApiResponse<Exam>>(`/exams/${examId}/submit-for-approval`, {}, authOptions()),

  approveExam: (examId: string) =>
    api.post<ApiResponse<Exam>>(`/exams/${examId}/approve`, {}, authOptions()),

  rejectExam: (examId: string, reason: string) =>
    api.post<ApiResponse<Exam>>(`/exams/${examId}/reject`, { reason }, authOptions()),

  publishExam: (examId: string) =>
    api.post<ApiResponse<Exam>>(`/exams/${examId}/publish`, {}, authOptions()),

  unpublishExam: (examId: string) =>
    api.post<ApiResponse<Exam>>(`/exams/${examId}/unpublish`, {}, authOptions()),

  // File attachments
  addAttachment: (examId: string, data: ExamAttachment) =>
    api.post<ApiResponse<Exam>>(`/exams/${examId}/attachments`, data, authOptions()),

  removeAttachment: (examId: string, publicId: string) =>
    api.delete<ApiResponse<Exam>>(`/exams/${examId}/attachments/${publicId}`, authOptions()),

  // Student exam taking (CBT)
  startExam: (examId: string) =>
    api.get<ApiResponse<{ attempt: ExamAttempt; questions: Question[] }>>(`/exams/${examId}/start`, authOptions()),

  saveAnswer: (examId: string, questionId: string, answer: string) =>
    api.post<ApiResponse<StudentAnswer>>(`/exams/${examId}/answer`, { questionId, answer }, authOptions()),

  submitExam: (examId: string) =>
    api.post<ApiResponse<ExamAttempt>>(`/exams/${examId}/submit`, {}, authOptions()),

  // Teacher grading (CBT)
  getSubmissions: (examId: string) =>
    api.get<ApiResponse<ExamAttempt[]>>(`/exams/${examId}/submissions`, authOptions()),

  getStudentSubmission: (examId: string, studentId: string) =>
    api.get<ApiResponse<{ answers: StudentAnswer[]; attempt: ExamAttempt }>>(`/exams/${examId}/submissions/${studentId}`, authOptions()),

  gradeAnswer: (examId: string, data: { studentId: string; questionId: string; score: number; feedback?: string }) =>
    api.patch<ApiResponse<StudentAnswer>>(`/exams/${examId}/grade`, data, authOptions()),

  finalizeGrades: (examId: string) =>
    api.post<ApiResponse<Score[]>>(`/exams/${examId}/finalize-grades`, {}, authOptions()),
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

  getChildAttendance: (childId: string, params?: { page?: number; limit?: number; startDate?: string; endDate?: string }) =>
    api.get<ApiResponse<{ child: any; summary: any; records: Attendance[] }>>(`/attendance/my-children/${childId}${buildQuery(params || {})}`, authOptions()),
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

  bulkAssign: (feeId: string) =>
    api.post<ApiResponse<{ assigned: number; skipped: number }>>(`/fees/${feeId}/bulk-assign`, {}, authOptions()),

  getStudentFees: (params?: { studentId?: string; status?: string }) =>
    api.get<ApiResponse<StudentFee[]>>(`/fees/student-fees${buildQuery(params || {})}`, authOptions()),

  getSummary: () =>
    api.get<ApiResponse<{ totalCollected: number; totalOutstanding: number }>>('/fees/summary', authOptions()),

  getMyChildrenFees: () =>
    api.get<ApiResponse<{ children: Student[]; studentFees: StudentFee[] }>>('/fees/my-children-fees', authOptions()),

  getChildFees: (childId: string) =>
    api.get<ApiResponse<{ child: any; studentFees: any[] }>>(`/fees/my-children-fees/${childId}`, authOptions()),
};

// ============ PAYMENTS ============
export const paymentService = {
  getAll: (params?: { page?: number; limit?: number; studentId?: string; paymentStatus?: string; paymentCategory?: string; startDate?: string; endDate?: string; sortBy?: string; sortOrder?: string }) =>
    api.get<ApiResponse<Payment[]>>(`/payments${buildQuery(params || {})}`, authOptions()),

  getById: (id: string) =>
    api.get<ApiResponse<Payment>>(`/payments/${id}`, authOptions()),

  create: (data: CreatePaymentData) =>
    api.post<ApiResponse<Payment>>('/payments', data, authOptions()),

  update: (id: string, data: Record<string, any>) =>
    api.patch<ApiResponse<Payment>>(`/payments/${id}`, data, authOptions()),

  getSummary: (params?: { sessionId?: string; term?: number }) =>
    api.get<ApiResponse<{ totalPayments: number; byCategory: Record<string, number>; byStatus: Record<string, number> }>>(`/payments/summary${buildQuery(params || {})}`, authOptions()),

  initialize: (data: { studentFeeId: string; term?: number }) =>
    api.post<ApiResponse<{ authorization_url: string; access_code: string; reference: string }>>('/payments/initialize', data, authOptions()),

  verify: (reference: string) =>
    api.get<ApiResponse<{ status: string; payment: Payment }>>(`/payments/verify/${reference}`, authOptions()),

  reverify: (reference: string) =>
    api.post<ApiResponse<{ status: string; payment: Payment }>>(`/payments/reverify/${reference}`, {}, authOptions()),

  getMyPayments: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<Payment[]>>(`/payments/my-payments${buildQuery(params || {})}`, authOptions()),
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

// ============ AUDIT LOGS ============
export const auditLogService = {
  getAll: (params?: { page?: number; limit?: number; action?: string; startDate?: string; endDate?: string; userId?: string }) =>
    api.get<ApiResponse<any[]>>(`/audit-logs${buildQuery(params || {})}`, authOptions()),
};

// ============ CHAT ============
export const chatService = {
  getRooms: () =>
    api.get<ApiResponse<any[]>>('/chat/rooms', authOptions()),

  getMessages: (roomId: string, params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<any[]>>(`/chat/rooms/${roomId}/messages${buildQuery(params || {})}`, authOptions()),
};
