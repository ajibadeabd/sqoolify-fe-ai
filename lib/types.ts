// Pagination
export interface PaginationInfo {
  total: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: number | null;
  previousPage: number | null;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  pagination?: PaginationInfo;
}

export interface PaginatedResponse<T> {
  result: T[];
  pagination: PaginationInfo;
}

// Auth
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  schoolName: string;
  phone?: string;
  slug?: string;
}

export interface AuthResponse {
  data: {
    user?: User;
    school?: School;
    accessToken?: string;
    refreshToken?: string;
    requiresSchoolSelection?: boolean;
    userId?: string;
    schools?: { schoolId: string; roles: string[] }[];
  };
  message: string;
}

// User
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  isVerify: boolean;
  schools: { schoolId: string; roles: string[] }[];
  school?: string;
  role?: string;
  permissions: string[];
  currentSchool?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

// Site Builder
export enum SectionType {
  HERO = 'hero',
  TEXT = 'text',
  FEATURES = 'features',
  GALLERY = 'gallery',
  CONTACT = 'contact',
  CTA = 'cta',
}

export interface HeroSectionContent {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  ctaText?: string;
  ctaLink?: string;
}

export interface TextSectionContent {
  title?: string;
  content: string;
  alignment?: 'left' | 'center' | 'right';
}

export interface FeatureItem {
  icon?: string;
  title: string;
  description: string;
}

export interface FeaturesSectionContent {
  title?: string;
  subtitle?: string;
  features: FeatureItem[];
  columns?: number;
}

export interface GalleryImage {
  url: string;
  caption?: string;
}

export interface GallerySectionContent {
  title?: string;
  images: GalleryImage[];
}

export interface ContactSectionContent {
  title?: string;
  contactInfo?: {
    address?: string;
    phone?: string;
    email?: string;
  };
}

export interface CTASectionContent {
  title: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  backgroundColor?: string;
}

export type SectionContent =
  | HeroSectionContent
  | TextSectionContent
  | FeaturesSectionContent
  | GallerySectionContent
  | ContactSectionContent
  | CTASectionContent;

export interface PageSection {
  type: SectionType;
  content: SectionContent;
  isVisible?: boolean;
}

export interface SitePage {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  sections: PageSection[];
  isPublished: boolean;
  isHomePage: boolean;
  order: number;
  school: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
}

export interface SiteConfig {
  primaryColor?: string;
  footerText?: string;
  socialLinks?: SocialLinks;
}

export interface PublicSchool {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  motto?: string;
  phone?: string;
  email?: string;
  address?: string;
  description?: string;
  siteConfig?: SiteConfig;
}

// School
export interface School {
  _id: string;
  name: string;
  plan?: string;
  country?: string;
  type?: 'small' | 'medium' | 'large';
  size?: number;
  schoolCode?: string;
  schoolInformation?: SchoolInformation;
  schoolSetup?: SchoolSetup;
  ownerInformation?: OwnerInformation;
  schoolUsers?: string[];
  isActive: boolean;
  siteConfig?: SiteConfig;
  createdAt?: string;
  updatedAt?: string;
}

export interface SchoolInformation {
  description: string;
  name: string;
  schoolType: string;
  email?: string;
  phone?: string;
  address: {
    schoolAddress: string;
    localGovernment: string;
    state: string;
  };
}

export interface SchoolSetup {
  logo?: string;
  foundingDate: string;
  schoolShortName: string;
  schoolMotto?: string;
  studentGender: string;
  schoolPhoneNumber: string;
  schoolEmailAddress: string;
  schoolAddress: string;
  lga?: string;
  country: string;
  schoolWebsite?: string;
}

export interface OwnerInformation {
  firstName: string;
  lastName: string;
  country: string;
  nationality: string;
  address: string;
  phoneNumber: string;
  email: string;
  gender: string;
  idCard: {
    idType: string;
    idNumber: string;
  };
}

// Student
export interface Student {
  _id: string;
  admissionNo: string;
  user: User | string;
  class?: SchoolClass | string;
  parent?: Parent | string;
  dateOfBirth?: string;
  gender?: 'male' | 'female';
  address?: string;
  bloodGroup?: string;
  admissionDate?: string;
  status?: 'active' | 'inactive' | 'graduated' | 'transferred' | 'suspended';
  session?: Session | string;
  school: string;
  language?: string;
  aboutMe?: string;
  hobbies?: string[];
  photo?: string;
  rowNumber?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStudentData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female';
  address?: string;
  bloodGroup?: string;
  admissionDate?: string;
  status?: 'active' | 'inactive' | 'graduated' | 'transferred' | 'suspended';
  classId?: string;
  parentId?: string;
  language?: string;
  aboutMe?: string;
  hobbies?: string[];
  photo?: string;
}

// Teacher
export interface Teacher {
  _id: string;
  user: User | string;
  employeeId?: string;
  qualification?: string;
  level?: string;
  aboutMe?: string;
  employmentDate?: string;
  experience?: string;
  primarySubject?: string;
  address?: string;
  isActive?: boolean;
  classes: (SchoolClass | string)[];
  subjects: (Subject | string)[];
  school: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTeacherData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  employeeId?: string;
  qualification?: string;
  level?: string;
  aboutMe?: string;
  employmentDate?: string;
  experience?: string;
  primarySubject?: string;
  address?: string;
  isActive?: boolean;
}

// Parent
export interface Parent {
  _id: string;
  user: User | string;
  occupation?: string;
  children: (Student | string)[];
  relationship?: string;
  address?: string;
  isActive?: boolean;
  school: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateParentData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  occupation?: string;
  relationship?: string;
  address?: string;
  isActive?: boolean;
}

// Class
export interface SchoolClass {
  _id: string;
  name: string;
  section?: string;
  classTeacher?: Teacher | string;
  level?: string;
  room?: string;
  description?: string;
  students: (Student | string)[];
  subjects?: { subject: Subject | string; teachers: (Teacher | string)[] }[];
  capacity: number;
  session?: Session | string;
  school: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateClassData {
  name: string;
  section?: string;
  capacity?: number;
  level?: string;
  room?: string;
  description?: string;
  classTeacherId?: string;
  sessionId?: string;
}

// Subject
export interface Subject {
  _id: string;
  name: string;
  code: string;
  isCore?: boolean;
  description?: string;
  isActive?: boolean;
  teachers?: (Teacher | string)[];
  school: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSubjectData {
  name: string;
  code: string;
  isCore?: boolean;
  teacherIds?: string[];
  description?: string;
  isActive?: boolean;
}

// Session
export interface Session {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  currentTerm?: number;
  terms: Term[];
  school: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Term {
  name: string;
  startDate: string;
  endDate: string;
}

export interface CreateSessionData {
  name: string;
  startDate: string;
  endDate: string;
  terms?: Term[];
}

// Exam
export type ExamMode = 'traditional' | 'cbt' | 'file-upload' | 'hybrid';

export interface ExamAttachment {
  url: string;
  publicId: string;
  filename: string;
  fileType: string;
}

export interface Exam {
  _id: string;
  name: string;
  type: string;
  class: SchoolClass | string;
  subject: Subject | string;
  session: Session | string;
  term: 'First' | 'Second' | 'Third';
  maxScore: number;
  date?: string;
  examMode?: ExamMode;
  duration?: number;
  attachments?: ExamAttachment[];
  published?: boolean;
  approvalStatus?: 'draft' | 'pending_approval' | 'approved' | 'rejected';
  rejectionReason?: string;
  submittedBy?: string;
  approvedBy?: string;
  startTime?: string;
  endTime?: string;
  school: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateExamData {
  name: string;
  type: string;
  classId: string;
  subjectId: string;
  sessionId: string;
  term: string;
  maxScore: number;
  date?: string;
  examMode?: ExamMode;
  duration?: number;
  startTime?: string;
  endTime?: string;
}

// Question (CBT)
export type QuestionType = 'mcq' | 'true_false' | 'short_answer' | 'essay';

export interface Question {
  _id: string;
  exam: string;
  type: QuestionType;
  questionText: string;
  points: number;
  order: number;
  options?: string[];
  correctAnswer?: string;
  markingScheme?: string;
  school: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateQuestionData {
  type: QuestionType;
  questionText: string;
  points: number;
  order?: number;
  options?: string[];
  correctAnswer?: string;
  markingScheme?: string;
}

// Student Answer (CBT)
export interface StudentAnswer {
  _id: string;
  student: Student | string;
  exam: string;
  question: Question | string;
  answer?: string;
  score?: number;
  isCorrect?: boolean;
  status: 'in_progress' | 'submitted' | 'graded';
  feedback?: string;
  school: string;
  createdAt?: string;
  updatedAt?: string;
}

// Exam Attempt (CBT)
export interface ExamAttempt {
  _id: string;
  student: Student | string;
  exam: string;
  startedAt: string;
  submittedAt?: string;
  totalScore?: number;
  status: 'in_progress' | 'submitted' | 'graded';
  timeSpent?: number;
  school: string;
  createdAt?: string;
  updatedAt?: string;
}

// Score
export interface Score {
  _id: string;
  student: Student | string;
  exam: Exam | string;
  subject: Subject | string;
  score: number;
  grade?: string;
  session: Session | string;
  term: 'First' | 'Second' | 'Third';
  school: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateScoreData {
  studentId: string;
  examId: string;
  subjectId: string;
  score: number;
  sessionId: string;
  term: 'First' | 'Second' | 'Third';
}

// Report Card
export interface ReportCard {
  _id: string;
  student: Student | string;
  class?: SchoolClass | string;
  session: Session | string;
  term: 'First' | 'Second' | 'Third';
  scores: (Score | string)[];
  totalScore?: number;
  average?: number;
  position?: number;
  status?: 'draft' | 'published';
  teacherRemark?: string;
  principalRemark?: string;
  school: string;
  createdAt?: string;
  updatedAt?: string;
}

// Attendance
export interface AttendanceRecord {
  student: Student | string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remark?: string;
}

export interface Attendance {
  _id: string;
  class: SchoolClass | string;
  date: string;
  session?: Session | string;
  term?: number;
  school: string;
  records: AttendanceRecord[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAttendanceData {
  classId: string;
  date: string;
  sessionId?: string;
  term?: number;
  records: { studentId: string; status: string; remark?: string }[];
}

export interface AttendanceSummary {
  studentId: string;
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: number;
}

// Bank
export interface Bank {
  _id: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
  isActive: boolean;
  school: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBankData {
  accountName: string;
  bankName: string;
  accountNumber: string;
}

// Notice
export interface Notice {
  _id: string;
  title: string;
  content: string;
  visibility: ('staff' | 'parent' | 'student' | 'everyone')[];
  notificationType: 'general' | 'academic' | 'event' | 'emergency';
  isPinned: boolean;
  expiresAt?: string;
  createdBy: User | string;
  school: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateNoticeData {
  title: string;
  content: string;
  visibility?: string[];
  notificationType?: string;
  isPinned?: boolean;
  expiresAt?: string;
}

// Plan
export interface PlanFeatures {
  maxStudents: number;
  maxTeachers: number;
  hasAttendance: boolean;
  hasExams: boolean;
  hasReportCards: boolean;
  hasNoticeBoard: boolean;
  hasPayments: boolean;
}

export interface Plan {
  _id: string;
  name: string;
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  features: PlanFeatures;
  isActive: boolean;
  trialDays: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Subscription
export interface Subscription {
  _id: string;
  plan: Plan | string;
  school: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled' | 'trial';
  autoRenew: boolean;
  lastPaymentDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubscriptionHistory {
  _id: string;
  subscription: Subscription | string;
  action: 'created' | 'renewed' | 'cancelled' | 'expired' | 'upgraded' | 'downgraded';
  previousPlan?: Plan | string;
  newPlan?: Plan | string;
  date: string;
  amount?: number;
}

// Fee
export interface FeeBreakdown {
  item: string;
  amount: number;
}

export interface FeeTerm {
  term: number;
  amount: number;
  breakdowns?: FeeBreakdown[];
  dueDate?: string;
}

export interface Fee {
  _id: string;
  school: string;
  class: SchoolClass | string;
  session: Session | string;
  terms: FeeTerm[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFeeData {
  classId: string;
  sessionId: string;
  terms: FeeTerm[];
}

// Student Fee
export interface FeePaymentRecord {
  amount: number;
  date: string;
  paymentRef?: string;
  method?: string;
  term?: number;
}

export interface StudentFee {
  _id: string;
  student: Student | string;
  fee: Fee | string;
  school: string;
  session: Session | string;
  amountPaid: number;
  balance: number;
  status: 'unpaid' | 'partial' | 'paid';
  payments: FeePaymentRecord[];
  createdAt?: string;
  updatedAt?: string;
}

// Payment
export interface Payment {
  _id: string;
  student: Student | string;
  school: string;
  amount: number;
  paymentCategory: 'school_fee' | 'registration' | 'other';
  paymentType: 'offline' | 'online' | 'bank_transfer' | 'cash';
  paymentMethod?: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  reference?: string;
  session?: Session | string;
  term?: number;
  studentFee?: StudentFee | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePaymentData {
  studentId: string;
  amount: number;
  paymentCategory?: string;
  paymentType: string;
  paymentMethod?: string;
  sessionId?: string;
  term?: number;
  studentFeeId?: string;
}

// Exam Result
export interface ScoreBreakdown {
  component: 'test' | 'assignment' | 'project' | 'quiz' | 'practical' | 'exam';
  score: number;
  maxScore: number;
}

export interface ExamResult {
  _id: string;
  student: Student | string;
  subject: Subject | string;
  class: SchoolClass | string;
  session: Session | string;
  term: number;
  school: string;
  scoreBreakdown: ScoreBreakdown[];
  totalScore: number;
  maxTotalScore: number;
  grade?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateExamResultData {
  studentId: string;
  subjectId: string;
  classId: string;
  sessionId: string;
  term: number;
  scoreBreakdown: ScoreBreakdown[];
  totalScore: number;
  maxTotalScore: number;
}

// Assessment Config
export interface AssessmentComponent {
  name: string;
  maxScore: number;
  weight: number;
}

export interface GradeScale {
  grade: string;
  minScore: number;
  maxScore: number;
  remark?: string;
}

export interface AssessmentConfig {
  _id: string;
  school: string;
  session?: Session | string;
  components: AssessmentComponent[];
  gradingScale: GradeScale[];
  createdAt?: string;
  updatedAt?: string;
}

// App Config
export interface ClassLevel {
  name: string;
  shortCode: string;
}

export interface ConfigSettings {
  currency: string;
  timezone: string;
  academicYearStart: string;
  gradeSystem: string;
  attendanceRequired: boolean;
  feesEnabled: boolean;
  notificationsEnabled: boolean;
  termsPerSession: number;
  classLevels: ClassLevel[];
  sectionPresets: string[];
  examTypes: string[];
  paymentCategories: string[];
  paymentTypes: string[];
  paymentMethods: string[];
  studentStatuses: string[];
  noticeVisibility: string[];
  noticeTypes: string[];
}

export interface AppConfig {
  _id: string;
  school: string;
  settings: ConfigSettings;
  createdAt?: string;
  updatedAt?: string;
}

// Dashboard
export interface AttendanceBreakdown {
  present: number;
  absent: number;
  late: number;
  excused: number;
}

export interface ClassAttendance {
  className: string;
  attendanceRate: number;
  present: number;
  total: number;
}

export interface AdminDashboardStats {
  role: 'admin';
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  totalClasses: number;
  activeExams: number;
  totalRevenue: number;
  outstandingFees: number;
  attendanceRate: number;
  attendanceBreakdown?: AttendanceBreakdown;
  attendanceByClass?: ClassAttendance[];
}

export interface TeacherDashboardStats {
  role: 'teacher';
  myClasses: number;
  studentsCount: number;
  upcomingExams: number;
}

export interface StudentDashboardStats {
  role: 'student';
  myAttendanceRate: number;
  upcomingExams: number;
  pendingFees: number;
}

export interface ChildAttendanceSummary {
  _id: string;
  name: string;
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: number;
}

export interface ParentUpcomingFee {
  _id: string;
  childName: string;
  balance: number;
  amountPaid: number;
  status: string;
  dueDate: string | null;
}

export interface ParentRecentResult {
  _id: string;
  childName: string;
  examName: string;
  examType: string;
  subject: string;
  score: number;
  maxScore?: number;
  grade: string | null;
  date: string;
}

export interface ParentRecentPayment {
  _id: string;
  childName: string;
  amount: number;
  status: string;
  method: string | null;
  reference: string | null;
  date: string;
}

export interface ParentDashboardStats {
  role: 'parent';
  children: number;
  totalFees: number;
  totalPaid: number;
  totalPendingFees: number;
  childrenAttendance?: ChildAttendanceSummary[];
  upcomingFees?: ParentUpcomingFee[];
  recentResults?: ParentRecentResult[];
  recentPayments?: ParentRecentPayment[];
}

export type DashboardStats = AdminDashboardStats | TeacherDashboardStats | StudentDashboardStats | ParentDashboardStats;

// Chat
export interface ChatMessage {
  _id: string;
  sender: { _id: string; firstName: string; lastName: string } | string;
  room: string;
  content: string;
  school: string;
  createdAt?: string;
}

// File Upload
export interface UploadResponse {
  url: string;
  publicId: string;
}

// Timetable
export interface PeriodSlot {
  order: number;
  label: string;
  startTime: string;
  endTime: string;
  isBreak: boolean;
}

export interface PeriodConfig {
  _id: string;
  school: string;
  session?: string;
  periods: PeriodSlot[];
  days: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TimetableEntry {
  _id: string;
  class: SchoolClass | string;
  subject: Subject | string;
  teacher: Teacher | string;
  day: string;
  periodOrder: number;
  room?: string;
  session: Session | string;
  school: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTimetableEntryData {
  classId: string;
  subjectId: string;
  teacherId: string;
  day: string;
  periodOrder: number;
  room?: string;
  sessionId: string;
}

export interface BulkTimetableData {
  classId: string;
  sessionId: string;
  entries: CreateTimetableEntryData[];
}

export interface CreatePeriodConfigData {
  sessionId?: string;
  periods: PeriodSlot[];
  days?: string[];
}
