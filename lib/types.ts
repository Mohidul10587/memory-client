export type UserRole = 'STUDENT' | 'TEACHER' | 'SUPER_ADMIN';

export type BloodGroup =
  | 'A_POSITIVE'
  | 'A_NEGATIVE'
  | 'B_POSITIVE'
  | 'B_NEGATIVE'
  | 'O_POSITIVE'
  | 'O_NEGATIVE'
  | 'AB_POSITIVE'
  | 'AB_NEGATIVE';

export const BLOOD_GROUP_LABELS: Record<BloodGroup, string> = {
  A_POSITIVE: 'এ পজিটিভ (A+)',
  A_NEGATIVE: 'এ নেগেটিভ (A-)',
  B_POSITIVE: 'বি পজিটিভ (B+)',
  B_NEGATIVE: 'বি নেগেটিভ (B-)',
  O_POSITIVE: 'ও পজিটিভ (O+)',
  O_NEGATIVE: 'ও নেগেটিভ (O-)',
  AB_POSITIVE: 'এবি পজিটিভ (AB+)',
  AB_NEGATIVE: 'এবি নেগেটিভ (AB-)',
};

export interface School {
  id: string;
  name: string;
  eiin?: string;
  logo?: string;
  coverPhoto?: string;
  establishedYear: number;
  address: string;
  upazila: string;
  district: string;
  division: string;
  phone?: string;
  email?: string;
  website?: string;
  facebookPage?: string;
  isActive: boolean;
  createdAt: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  name: string;
  profileImage?: string;
  sscPassingYear: number;
  division?: string;
  district?: string;
  upazila?: string;
  union?: string;
  currentAddress?: string;
  permanentAddress?: string;
  profession?: string;
  workplace?: string;
  email?: string;
  facebookProfile?: string;
  bloodGroup?: BloodGroup;
  about?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherProfile {
  id: string;
  userId: string;
  name: string;
  profileImage?: string;
  joiningYear: number;
  subject: string;
  designation: string;
  division?: string;
  district?: string;
  upazila?: string;
  union?: string;
  currentAddress?: string;
  permanentAddress?: string;
  email?: string;
  facebookProfile?: string;
  bloodGroup?: BloodGroup;
  about?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  phone: string;
  role: UserRole;
  schoolId: string;
  isActive: boolean;
  createdAt: string;
  school?: Pick<School, 'id' | 'name' | 'logo'>;
  studentProfile?: StudentProfile;
  teacherProfile?: TeacherProfile;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface BatchInfo {
  year: number;
  count: number;
}
