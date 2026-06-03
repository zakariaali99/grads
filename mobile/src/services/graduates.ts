import api from '../lib/api';

export interface GraduateProfile {
  id: string;
  user: {
    id: string;
    username: string;
    full_name: string;
    avatar?: string;
  };
  headline?: string;
  college_name?: string;
  graduation_year?: number;
  major?: string;
  gpa?: number;
  city?: string;
  is_employed: boolean;
  current_company?: string;
  current_position?: string;
  available_for_work: boolean;
  skills_count: number;
  profile_completion: number;
}

export const graduateService = {
  getMyProfile: () =>
    api.get<GraduateProfile>('/graduates/my-profile/'),
  list: (params?: Record<string, any>) =>
    api.get<{ count: number; results: GraduateProfile[] }>('/graduates/profiles/', { params }),
};
