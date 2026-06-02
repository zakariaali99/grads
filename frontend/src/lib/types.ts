export interface User {
  id: string
  username: string
  email: string
  phone: string | null
  user_type: 'graduate' | 'employer' | 'admin' | 'institution'
  full_name: string
  first_name: string
  last_name: string
  gender: 'male' | 'female' | null
  date_of_birth: string | null
  avatar: string | null
  bio: string | null
  is_verified: boolean
  profile_completion: number
  date_joined: string
}

export interface GraduateProfile {
  id: string
  user: User
  headline: string | null
  college: string | null
  college_name: string
  graduation_year: number | null
  major: string | null
  gpa: number | null
  city: string | null
  is_employed: boolean
  current_company: string | null
  current_position: string | null
  skills: GraduateSkill[]
  education: Education[]
  certifications: Certification[]
  experience: Experience[]
  projects: Project[]
  cvs: CV[]
  available_for_work: boolean
  expected_salary: number | null
  linkedin_url: string | null
  github_url: string | null
  portfolio_url: string | null
  behance_url: string | null
  profile_views: number
  search_appearances: number
  employer_interactions: number
  created_at: string
  updated_at: string
}

export interface GraduateSkill {
  id: string
  skill: string
  skill_name: string
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  years_experience: number
  is_top_skill: boolean
}

export interface Education {
  id: string
  graduate: string
  degree: string
  field_of_study: string
  institution: string
  country: string | null
  start_date: string
  end_date: string | null
  is_current: boolean
  grade: string | null
  description: string | null
}

export interface Certification {
  id: string
  graduate: string
  name: string
  issuer: string
  issue_date: string
  expiry_date: string | null
  credential_id: string | null
  credential_url: string | null
  file: string | null
  is_verified: boolean
}

export interface Experience {
  id: string
  graduate: string
  title: string
  company: string
  location: string | null
  employment_type: string
  start_date: string
  end_date: string | null
  is_current: boolean
  description: string | null
}

export interface Project {
  id: string
  graduate: string
  title: string
  description: string | null
  technologies: string | null
  url: string | null
  image: string | null
  start_date: string | null
  end_date: string | null
  is_ongoing: boolean
}

export interface CV {
  id: string
  graduate: string
  title: string
  file: string
  language: 'ar' | 'en'
  is_default: boolean
  is_parsed: boolean
  upload_date: string
  download_count: number
}

export interface CompanyProfile {
  id: string
  user: User
  company_name: string
  company_name_en: string | null
  industry: string | null
  industry_name: string
  company_size: string
  website: string | null
  logo: string | null
  cover_image: string | null
  description: string | null
  city: string
  address: string | null
  phone: string | null
  linkedin_url: string | null
  twitter_url: string | null
  is_verified: boolean
  is_featured: boolean
  profile_views: number
  total_jobs: number
  total_hires: number
  job_count: number
  created_at: string
}

export interface JobPost {
  id: string
  title: string
  company: string
  company_name: string
  company_logo: string | null
  company_city: string
  company_verified: boolean
  category: string | null
  category_name: string
  employment_type: string
  experience_level: string
  city: string | null
  is_remote: boolean
  salary_min: number | null
  salary_max: number | null
  salary_currency: string
  skills_list: Skill[]
  description: string
  requirements: string | null
  responsibilities: string | null
  benefits: string | null
  vacancies: number
  status: string
  is_featured: boolean
  is_urgent: boolean
  views_count: number
  applications_count: number
  deadline: string | null
  published_at: string | null
  is_saved: boolean
  has_applied: boolean
  time_ago: string
}

export interface Skill {
  id: string
  name_ar: string
  name_en: string | null
  category: string | null
  category_name: string
  demand_score: number
}

export interface JobCategory {
  id: string
  name_ar: string
  name_en: string | null
  icon: string | null
}

export interface JobApplication {
  id: string
  job: string
  applicant: string
  applicant_name: string
  applicant_avatar: string | null
  job_title: string
  company_name: string
  cv: string | null
  cover_letter: string | null
  status: string
  match_score: number | null
  notes: string | null
  applied_at: string
}

export interface Interview {
  id: string
  application: string
  applicant_name: string
  job_title: string
  company_name: string
  interview_type: string
  status: string
  scheduled_at: string
  duration_minutes: number
  location: string | null
  notes: string | null
  feedback: string | null
}

export interface Notification {
  id: string
  recipient: string
  notification_type: string
  title: string
  message: string
  data: any
  is_read: boolean
  created_at: string
}

export interface Conversation {
  id: string
  participants: string[]
  participant_names: string[]
  subject: string | null
  job: string | null
  last_message: {
    content: string
    sender: string
    created_at: string
  } | null
  last_message_at: string | null
  is_active: boolean
  created_at: string
}

export interface Message {
  id: string
  conversation: string
  sender: string
  sender_name: string
  content: string
  file: string | null
  is_read: boolean
  created_at: string
}

export interface PaginatedResponse<T> {
  count: number
  total_pages: number
  current_page: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface AnalyticsSummary {
  total_users: number
  total_graduates: number
  total_employers: number
  total_companies: number
  verified_graduates: number
  verified_companies: number
  total_jobs: number
  active_jobs: number
  total_applications: number
}
