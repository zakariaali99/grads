import api from '../lib/api';
import { withOfflineFallback, isOnline } from './offline';
import { mockJobs } from '../data/mockData';

export interface JobListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: JobPost[];
}

export interface JobPost {
  id: string;
  title: string;
  company: string;
  company_name: string;
  company_logo?: string;
  company_city?: string;
  company_verified?: boolean;
  category?: string;
  category_name?: string;
  employment_type: string;
  experience_level: string;
  city?: string;
  is_remote: boolean;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  description?: string;
  requirements?: string;
  responsibilities?: string;
  benefits?: string;
  skills_list?: { id: string; name_ar: string; name_en?: string }[];
  vacancies: number;
  status: string;
  is_featured: boolean;
  is_urgent: boolean;
  views_count: number;
  applications_count: number;
  deadline?: string;
  published_at?: string;
  created_at?: string;
}

export const jobService = {
  list: (params?: Record<string, any>) =>
    withOfflineFallback(
      () => api.get<JobListResponse>('/jobs/', { params }),
      { count: mockJobs.length, next: null, previous: null, results: mockJobs },
    ),
  getById: (id: string) => {
    const job = mockJobs.find(j => j.id === id);
    return withOfflineFallback(
      () => api.get<JobPost>(`/jobs/${id}/`),
      job || mockJobs[0],
    );
  },
  search: (query: string, params?: Record<string, any>) => {
    const filtered = mockJobs.filter(j =>
      j.title.includes(query) || j.company_name.includes(query)
    );
    return withOfflineFallback(
      () => api.get<JobListResponse>('/jobs/', { params: { ...params, search: query } }),
      { count: filtered.length, next: null, previous: null, results: filtered },
    );
  },
  create: (data: Partial<JobPost>) =>
    api.post<JobPost>('/jobs/', data),
};
