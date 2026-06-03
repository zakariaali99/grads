import api from '../lib/api';
import { withOfflineFallback } from './offline';
import {
  mockAdminDashboard,
  mockInstitutionDashboard,
  mockEmployerAnalytics,
  mockCompanyProfile,
  mockGraduateProfile,
} from '../data/mockData';

export type AdminDashboardData = {
  total_users: number;
  total_graduates: number;
  total_employers: number;
  total_companies: number;
  verified_graduates: number;
  verified_companies: number;
  total_jobs: number;
  active_jobs: number;
  total_applications: number;
  trends: Record<string, number>;
  top_cities: { city: string; count: number }[];
  top_colleges: { college__name_ar: string; count: number }[];
};

export const adminService = {
  getDashboard: () =>
    withOfflineFallback(
      () => api.get<AdminDashboardData>('/analytics/admin/'),
      mockAdminDashboard as unknown as AdminDashboardData,
    ),

  listUsers: (params?: Record<string, any>) =>
    api.get<{ count: number; results: any[] }>('/admin/users/', { params }),

  listCompanies: (params?: Record<string, any>) =>
    api.get<{ count: number; results: any[] }>('/admin/companies/', { params }),

  listGraduates: (params?: Record<string, any>) =>
    api.get<{ count: number; results: any[] }>('/admin/graduates/', { params }),
};

export type InstitutionDashboardData = {
  total_alumni: number;
  employment_rate: number;
  avg_salary: number;
  partner_count: number;
  recent_graduates: any[];
};

export const institutionService = {
  getDashboard: () =>
    withOfflineFallback(
      () => api.get<InstitutionDashboardData>('/institution/dashboard/'),
      mockInstitutionDashboard as unknown as InstitutionDashboardData,
    ),

  listGraduates: (params?: Record<string, any>) =>
    api.get<{ count: number; results: any[] }>('/institution/graduates/', { params }),
};

export type EmployerAnalyticsData = {
  jobs: Record<string, number>;
  applications: Record<string, number>;
  conversion_funnel: Record<string, number>;
};

export type CompanyProfileData = {
  id: string;
  company_name: string;
  industry_name?: string;
  city?: string;
  company_size?: string;
  description?: string;
  is_verified: boolean;
  logo?: string;
  total_jobs: number;
  total_hires: number;
  profile_views: number;
};

export const employerService = {
  getMyCompany: () =>
    withOfflineFallback(
      () => api.get<CompanyProfileData>('/employers/my-company/'),
      mockCompanyProfile as unknown as CompanyProfileData,
    ),

  getAnalytics: () =>
    withOfflineFallback(
      () => api.get<EmployerAnalyticsData>('/analytics/employer/'),
      mockEmployerAnalytics as unknown as EmployerAnalyticsData,
    ),
};

export type GraduateProfileData = {
  id: string;
  headline?: string;
  city?: string;
  major?: string;
  gpa?: number;
  college_name?: string;
  graduation_year?: number;
  is_employed: boolean;
  current_company?: string;
  current_position?: string;
  available_for_work: boolean;
  profile_views: number;
  skills: { id: string; name_ar: string; proficiency?: number }[];
  education: { id: string; degree: string; school: string; field_of_study?: string; start_year?: number; end_year?: number }[];
  experience: { id: string; title: string; company: string; start_date?: string; end_date?: string; is_current?: boolean }[];
  certifications: { id: string; name: string; issuer?: string; date?: string }[];
};

export const graduateProfileService = {
  getMyProfile: () =>
    withOfflineFallback(
      () => api.get<GraduateProfileData>('/graduates/my-profile/'),
      mockGraduateProfile as unknown as GraduateProfileData,
    ),

  getAnalytics: () =>
    api.get<{
      profile: Record<string, number>;
      applications: Record<string, number>;
    }>('/analytics/graduate/'),
};
