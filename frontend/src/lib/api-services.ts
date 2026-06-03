import api from './api'
import type {
  User, GraduateProfile, CompanyProfile, JobPost, JobApplication,
  Interview, Notification, Conversation, Message, PaginatedResponse,
  Education, Certification, Experience, Project, Skill, JobCategory,
  AnalyticsSummary, PipelineStage, Scorecard, ScorecardCriterion, ScorecardResult
} from './types'

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authService = {
  login: (username: string, password: string) =>
    api.post('/auth/login/', { username, password }),
  register: (data: any) => api.post('/auth/register/', data),
  refresh: (refresh: string) => api.post('/auth/refresh/', { refresh }),
  getProfile: () => api.get<User>('/auth/profile/'),
  updateProfile: (data: Partial<User>) => api.patch('/auth/profile/', data),
  changePassword: (data: { old_password: string; new_password: string; new_password_confirm: string }) =>
    api.put('/auth/change-password/', data),
  deleteAccount: () => api.delete('/auth/delete-account/'),
  passwordReset: (data: { email: string }) => api.post('/auth/password-reset/', data),
  passwordResetConfirm: (data: { code: string; password: string; password_confirm: string }) =>
    api.post('/auth/password-reset/confirm/', data),
}

// ─── Graduate Profile ────────────────────────────────────────────────────────
export const graduateService = {
  getMyProfile: () => api.get<GraduateProfile>('/graduates/profiles/me/'),
  getProfile: (id: string) => api.get<GraduateProfile>(`/graduates/profiles/${id}/`),
  updateProfile: (id: string, data: any) => api.patch(`/graduates/profiles/${id}/`, data),
  listProfiles: (params?: any) => api.get<PaginatedResponse<GraduateProfile>>('/graduates/profiles/', { params }),
  addSkill: (profileId: string, data: any) => api.post(`/graduates/profiles/${profileId}/add_skill/`, data),
  removeSkill: (profileId: string, data: any) => api.delete(`/graduates/profiles/${profileId}/remove_skill/`, { data }),

  // Education
  getEducation: () => api.get<Education[]>('/graduates/education/'),
  createEducation: (data: any) => api.post('/graduates/education/', data),
  updateEducation: (id: string, data: any) => api.patch(`/graduates/education/${id}/`, data),
  deleteEducation: (id: string) => api.delete(`/graduates/education/${id}/`),

  // Certifications
  getCertifications: () => api.get<Certification[]>('/graduates/certifications/'),
  createCertification: (data: any) => api.post('/graduates/certifications/', data),
  updateCertification: (id: string, data: any) => api.patch(`/graduates/certifications/${id}/`, data),
  deleteCertification: (id: string) => api.delete(`/graduates/certifications/${id}/`),

  // Experience
  getExperience: () => api.get<Experience[]>('/graduates/experience/'),
  createExperience: (data: any) => api.post('/graduates/experience/', data),
  updateExperience: (id: string, data: any) => api.patch(`/graduates/experience/${id}/`, data),
  deleteExperience: (id: string) => api.delete(`/graduates/experience/${id}/`),

  // Projects
  getProjects: () => api.get<Project[]>('/graduates/projects/'),
  createProject: (data: any) => api.post('/graduates/projects/', data),
  updateProject: (id: string, data: any) => api.patch(`/graduates/projects/${id}/`, data),
  deleteProject: (id: string) => api.delete(`/graduates/projects/${id}/`),

  // Skills
  getSkills: (params?: any) => api.get<Skill[]>('/graduates/skills/', { params }),
  getSkillCategories: () => api.get('/graduates/skill-categories/'),

  // Colleges
  getColleges: (params?: any) => api.get('/graduates/colleges/', { params }),

  // Saved Jobs for graduate
  getSavedJobs: () => api.get('/jobs/saved/'),
  saveJob: (jobId: string) => api.post('/jobs/saved/', { job: jobId }),
  unsaveJob: (id: string) => api.delete(`/jobs/saved/${id}/`),
}

// ─── Employer / Company ──────────────────────────────────────────────────────
export const employerService = {
  getMyCompany: () => api.get<CompanyProfile>('/employers/companies/me/'),
  getCompany: (id: string) => api.get<CompanyProfile>(`/employers/companies/${id}/`),
  createCompany: (data: any) => api.post('/employers/companies/', data),
  updateCompany: (id: string, data: any) => api.patch(`/employers/companies/${id}/`, data),
  addHrMember: (companyId: string, data: any) => api.post(`/employers/companies/${companyId}/add_hr_member/`, data),
  getIndustries: () => api.get('/employers/industries/'),
  getReviews: (companyId: string) => api.get(`/employers/reviews/?company=${companyId}`),
  submitReview: (data: { company: string; rating: number; review: string }) =>
    api.post('/employers/reviews/', data),
  approveReview: (id: string) => api.post(`/employers/reviews/${id}/approve/`),
  requestVerification: (companyId: string) => api.post(`/employers/companies/${companyId}/request-verification/`),
}

// ─── Jobs ────────────────────────────────────────────────────────────────────
export const jobService = {
  listJobs: (params?: any) => api.get<PaginatedResponse<JobPost>>('/jobs/posts/', { params }),
  getJob: (id: string) => api.get<JobPost>(`/jobs/posts/${id}/`),
  createJob: (data: any) => api.post('/jobs/posts/', data),
  updateJob: (id: string, data: any) => api.patch(`/jobs/posts/${id}/`, data),
  deleteJob: (id: string) => api.delete(`/jobs/posts/${id}/`),
  publishJob: (id: string) => api.post(`/jobs/posts/${id}/publish/`),
  closeJob: (id: string) => api.post(`/jobs/posts/${id}/close/`),
  applyToJob: (id: string, data: any) => api.post(`/jobs/posts/${id}/apply/`, data),
  toggleSaveJob: (id: string) => api.get(`/jobs/posts/${id}/save/`),
  incrementView: (id: string) => api.post(`/jobs/posts/${id}/increment_view/`),
  getJobApplications: (id: string) => api.get(`/jobs/posts/${id}/applications/`),
  getCategories: () => api.get<JobCategory[]>('/jobs/categories/'),
}

// ─── Applications ────────────────────────────────────────────────────────────
export const applicationService = {
  list: (params?: any) => api.get<PaginatedResponse<JobApplication>>('/jobs/applications/', { params }),
  get: (id: string) => api.get<JobApplication>(`/jobs/applications/${id}/`),
  updateStatus: (id: string, status: string) =>
    api.post(`/jobs/applications/${id}/update_status/`, { status }),
}

// ─── Interviews ──────────────────────────────────────────────────────────────
export const interviewService = {
  list: (params?: any) => api.get<Interview[]>('/jobs/interviews/', { params }),
  create: (data: any) => api.post('/jobs/interviews/', data),
  update: (id: string, data: any) => api.patch(`/jobs/interviews/${id}/`, data),
  delete: (id: string) => api.delete(`/jobs/interviews/${id}/`),
}

// ─── Notifications ───────────────────────────────────────────────────────────
export const notificationService = {
  list: () => api.get<Notification[]>('/notifications/'),
  unreadCount: () => api.get<{ count: number }>('/notifications/unread-count/'),
  markRead: (id: string) => api.post(`/notifications/${id}/mark-read/`),
  markAllRead: () => api.post('/notifications/mark-all-read/'),
}

// ─── Chat ────────────────────────────────────────────────────────────────────
export const chatService = {
  getConversations: () => api.get<Conversation[]>('/chat/conversations/'),
  createConversation: (data: any) => api.post('/chat/conversations/', data),
  getMessages: (conversationId: string) => api.get<Message[]>(`/chat/conversations/${conversationId}/messages/`),
  sendMessage: (data: any) => api.post('/chat/messages/', data),
}

// ─── Analytics ───────────────────────────────────────────────────────────────
export const analyticsService = {
  admin: () => api.get<AnalyticsSummary>('/analytics/admin/'),
  employer: () => api.get('/analytics/employer/'),
  graduate: () => api.get('/analytics/graduate/'),
}

// ─── CV ───────────────────────────────────────────────────────────────────────
export const cvService = {
  list: () => api.get('/graduates/cvs/'),
  create: (data: FormData) => api.post('/graduates/cvs/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id: string, data: FormData) => api.patch(`/graduates/cvs/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id: string) => api.delete(`/graduates/cvs/${id}/`),
  setDefault: (id: string) => api.post(`/graduates/cvs/${id}/set_default/`),
}

// ─── AI ──────────────────────────────────────────────────────────────────────
export const aiService = {
  parseCv: (cvId: string) => api.post('/ai/parse-cv/', { cv_id: cvId }),
  jobRecommendations: () => api.get('/ai/job-recommendations/'),
  skillAnalysis: () => api.get('/ai/skill-analysis/'),
  rankCandidates: (jobId: string) => api.get(`/ai/rank-candidates/${jobId}/`),
}

// ─── Admin ───────────────────────────────────────────────────────────────────
export const adminService = {
  listUsers: (params?: any) => api.get<PaginatedResponse<User>>('/admin/users/', { params }),
  banUser: (id: string) => api.post(`/admin/users/${id}/ban/`),
  unbanUser: (id: string) => api.post(`/admin/users/${id}/unban/`),
  verifyUser: (id: string) => api.post(`/admin/users/${id}/verify/`),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}/`),
  updateUser: (id: string, data: any) => api.patch(`/admin/users/${id}/`, data),

  listGraduates: (params?: any) => api.get('/admin/graduates/', { params }),
  deleteGraduate: (id: string) => api.delete(`/admin/graduates/${id}/`),

  listCompanies: (params?: any) => api.get('/admin/companies/', { params }),
  deleteCompany: (id: string) => api.delete(`/admin/companies/${id}/`),

  verifyCompany: (id: string) => api.post(`/admin/companies/${id}/verify/`),
  verifyGraduate: (id: string) => api.post(`/admin/graduates/${id}/verify/`),
  toggleFeaturedCompany: (id: string) => api.post(`/admin/companies/${id}/toggle-featured/`),
  toggleFeaturedJob: (id: string) => api.post(`/admin/jobs/${id}/toggle-featured/`),

  getAuditLogs: (params?: any) => api.get('/admin/audit-logs/', { params }),
  getPlatformEvents: (params?: any) => api.get('/admin/platform-events/', { params }),
  getDailyStats: (params?: any) => api.get('/admin/daily-stats/', { params }),
}

// ─── Ads ──────────────────────────────────────────────────────────────────────
export interface AdvertisementData {
  id: number
  title: string
  description: string
  image_url: string
  link_url: string
  placement: 'small' | 'medium' | 'large' | 'sidebar'
  is_active: boolean
  sort_order: number
  click_count: number
  created_at: string
}

export const adService = {
  list: (placement?: string) =>
    api.get<PaginatedResponse<AdvertisementData>>('/ads/', { params: placement ? { placement } : {} }),
  recordClick: (id: number) => api.post(`/ads/${id}/record_click/`),
  admin: {
    list: () => api.get<PaginatedResponse<AdvertisementData>>('/admin/ads/'),
    create: (data: any) => api.post('/admin/ads/', data),
    update: (id: number, data: any) => api.patch(`/admin/ads/${id}/`, data),
    delete: (id: number) => api.delete(`/admin/ads/${id}/`),
  },
}

// ─── Pipeline & Scorecard ──────────────────────────────────────────────────────
export const pipelineService = {
  getStages: () => api.get<PipelineStage[]>('/jobs/pipeline-stages/'),
  getApplicationStage: (appId: string) => api.get(`/jobs/applications/${appId}/stage/`),
  updateApplicationStage: (appId: string, stageId: string, notes?: string) =>
    api.post(`/jobs/applications/${appId}/stage/`, { stage_id: stageId, notes: notes || '' }),
  getScorecards: (jobId: string) => api.get<Scorecard[]>(`/jobs/scorecards/?job=${jobId}`),
  createScorecard: (data: any) => api.post('/jobs/scorecards/', data),
  updateScorecard: (id: string, data: any) => api.patch(`/jobs/scorecards/${id}/`, data),
  deleteScorecard: (id: string) => api.delete(`/jobs/scorecards/${id}/`),
  getCriteria: (scorecardId: string) => api.get<ScorecardCriterion[]>(`/jobs/scorecards/${scorecardId}/criteria/`),
  createCriterion: (scorecardId: string, data: any) => api.post(`/jobs/scorecards/${scorecardId}/criteria/`, data),
  deleteCriterion: (scorecardId: string, id: string) => api.delete(`/jobs/scorecards/${scorecardId}/criteria/${id}/`),
  submitResult: (data: any) => api.post('/jobs/scorecard-results/', data),
  getResults: (appId?: string) =>
    api.get<ScorecardResult[]>('/jobs/scorecard-results/', { params: appId ? { application: appId } : {} }),
}

// ─── Search ────────────────────────────────────────────────────────────────────
export const socialService = {
  getFeed: (params?: any) => api.get('/social/feed/', { params }),
  createPost: (data: any) => api.post('/social/posts/', data),
  deletePost: (id: string) => api.delete(`/social/posts/${id}/`),
  toggleLike: (postId: string, reactionType: string) => api.post(`/social/posts/${postId}/like/`, { reaction_type: reactionType }),
  getComments: (postId: string) => api.get(`/social/posts/${postId}/comments/`),
  createComment: (postId: string, data: any) => api.post(`/social/posts/${postId}/comments/`, data),
  followUser: (userId: string) => api.post(`/social/follow/${userId}/`),
  unfollowUser: (userId: string) => api.delete(`/social/follow/${userId}/`),
  followStatus: (userId: string) => api.get(`/social/follow/status/${userId}/`),
}

export const searchService = {
  globalSearch: (data: { query: string; filters?: any; page?: number; page_size?: number; sort?: string }) =>
    api.post('/search/global/', data),
}
