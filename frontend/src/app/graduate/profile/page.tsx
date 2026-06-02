'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useAuthStore } from '@/store/authStore'
import { graduateService } from '@/lib/api-services'
import {
  User, Mail, Phone, MapPin, Calendar, Briefcase, GraduationCap,
  Award, Clock, Edit2, CheckCircle, Plus, ExternalLink, ChevronRight,
  BookOpen, Globe, Github, Linkedin, ShieldCheck, Star,
  Building2, FileText, Trash2, Save, X, Loader2
} from 'lucide-react'
import type { GraduateProfile, Education, Certification, Experience, Project, Skill } from '@/lib/types'
import { useTranslation } from '@/i18n'

const ProfileSection = ({ title, icon: Icon, children, onEdit }: {
  title: string; icon: any; children: React.ReactNode; onEdit?: () => void
}) => {
  const { t } = useTranslation()
  return (
  <div className="glass-card p-6 animate-fade-in">
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-primary-500" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
      </div>
      {onEdit && (
        <button onClick={onEdit} className="btn-ghost text-primary-500 hover:text-primary-600">
          <Edit2 className="w-4 h-4" />
          <span className="hidden sm:inline">{t('edit')}</span>
        </button>
      )}
    </div>
    {children}
  </div>
  )
}

export default function ProfilePage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [profile, setProfile] = useState<GraduateProfile | null>(null)
  const [education, setEducation] = useState<Education[]>([])
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [experience, setExperience] = useState<Experience[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAllSkills, setShowAllSkills] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)

  const fetchAll = async () => {
    setLoading(true)
    setError(null)
    try {
      const [profileRes, eduRes, certRes, expRes, projRes] = await Promise.all([
        graduateService.getMyProfile(),
        graduateService.getEducation(),
        graduateService.getCertifications(),
        graduateService.getExperience(),
        graduateService.getProjects(),
      ])
      setProfile(profileRes.data)
      setEducation(eduRes.data)
      setCertifications(certRes.data)
      setExperience(expRes.data)
      setProjects(projRes.data)
    } catch {
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  if (loading) {
    return (
      <DashboardLayout role="graduate">
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !profile) {
    return (
      <DashboardLayout role="graduate">
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-red-500 mb-4">{error || t('unavailable')}</p>
          <button onClick={fetchAll} className="btn-primary">{t('retry')}</button>
        </div>
      </DashboardLayout>
    )
  }

  const displayedSkills = showAllSkills ? profile.skills : profile.skills.slice(0, 5)

  return (
    <DashboardLayout role="graduate">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="glass-card p-8 relative overflow-hidden animate-fade-in">
          <div className="absolute top-0 left-0 w-full h-32 gradient-primary opacity-10" />
          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative">
              <div className="w-28 h-28 rounded-full gradient-primary flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {(user?.full_name || 'U')[0]}
              </div>
              {profile.user.is_verified && (
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1.5 border-4 border-white dark:border-navy-800">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 text-center sm:text-right">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{profile.user.full_name}</h1>
                {profile.user.is_verified && <ShieldCheck className="w-6 h-6 text-primary-500" />}
              </div>
              <p className="text-lg text-primary-500 font-medium mb-3">{profile.headline || t('role.graduate')}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-sm text-gray-500 dark:text-gray-400">
                {profile.city && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{profile.city}</span>}
                {profile.current_position && <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" />{profile.current_position}</span>}
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{profile.available_for_work ? t('available_for_work') : t('unavailable')}</span>
              </div>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
                {profile.user.is_verified && <span className="badge-success">{t('verified')}</span>}
                {profile.college_name && <span className="badge-primary">{profile.college_name}</span>}
                {profile.available_for_work && <span className="badge-warning">{t('graduate.profile.looking_for_job')}</span>}
              </div>
              <div className="flex justify-center sm:justify-start gap-3 mt-4">
                <button className="btn-primary text-sm py-2 px-4"><Edit2 className="w-4 h-4" />{t('graduate.profile.edit')}</button>
              </div>
            </div>
            <div className="hidden sm:flex flex-col items-center gap-2 p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20">
              <div className="text-2xl font-bold text-primary-500">{profile.user.profile_completion}%</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{t('profile_completion')}</div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="gradient-primary h-2 rounded-full" style={{ width: `${profile.user.profile_completion}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info Bar */}
        <div className="glass-card p-4 animate-fade-in">
          <div className="flex flex-wrap justify-center sm:justify-start gap-6 text-sm">
            <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Mail className="w-4 h-4 text-primary-500" />{profile.user.email}
            </span>
            {profile.user.phone && (
              <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4 text-primary-500" />{profile.user.phone}
              </span>
            )}
            {profile.linkedin_url && (
              <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Linkedin className="w-4 h-4 text-primary-500" />{profile.linkedin_url}
              </span>
            )}
            {profile.github_url && (
              <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Github className="w-4 h-4 text-primary-500" />{profile.github_url}
              </span>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <ProfileSection title={t('bio')} icon={User}>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {profile.user.bio || t('graduate.profile.no_bio')}
              </p>
            </ProfileSection>

            {/* Experience */}
            <ProfileSection title={t('graduate.profile.experience')} icon={Briefcase}>
              {experience.length > 0 ? (
                <div className="space-y-5">
                  {experience.map((exp) => (
                    <div key={exp.id} className="relative pr-6 pb-5 border-r-2 border-primary-200 dark:border-primary-800 last:pb-0">
                      <div className="absolute -right-2 top-0 w-4 h-4 rounded-full bg-primary-500 border-2 border-white dark:border-navy-800" />
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white">{exp.title}</h4>
                          <p className="text-sm text-primary-500 font-medium">{exp.company}</p>
                        </div>
                        <span className="badge-primary text-xs whitespace-nowrap">{exp.employment_type}</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        {exp.start_date} - {exp.is_current ? t('present') : exp.end_date}
                      </p>
                      {exp.description && <p className="text-sm text-gray-600 dark:text-gray-400">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t('graduate.profile.no_experience')}</p>
              )}
            </ProfileSection>

            {/* Education */}
            <ProfileSection title={t('education')} icon={GraduationCap}>
              {education.length > 0 ? (
                <div className="space-y-4">
                  {education.map((edu) => (
                    <div key={edu.id} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-navy-800/50">
                      <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-6 h-6 text-primary-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 dark:text-white">{edu.degree} - {edu.field_of_study}</h4>
                        <p className="text-sm text-primary-500">{edu.institution}</p>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                          <span>{edu.start_date} - {edu.is_current ? t('present') : edu.end_date}</span>
                          {edu.grade && <><span>•</span><span>{t('gpa')}: {edu.grade}</span></>}
                        </div>
                        {edu.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{edu.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t('graduate.profile.no_education')}</p>
              )}
            </ProfileSection>

            {/* Projects */}
            <ProfileSection title={t('projects')} icon={FileText}>
              {projects.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {projects.map((project) => (
                    <div key={project.id} className="p-4 rounded-xl bg-gray-50 dark:bg-navy-800/50 card-hover">
                      <h4 className="font-bold text-gray-900 dark:text-white mb-1">{project.title}</h4>
                      {project.description && <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{project.description}</p>}
                      {project.technologies && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {project.technologies.split(',').map((t) => (
                            <span key={t.trim()} className="badge-primary text-xs">{t.trim()}</span>
                          ))}
                        </div>
                      )}
                      {project.url && (
                        <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1 font-medium">
                          <ExternalLink className="w-3.5 h-3.5" /> {t('view_details')}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t('graduate.profile.no_projects')}</p>
              )}
            </ProfileSection>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Skills */}
            <ProfileSection title={t('skills')} icon={Star}>
              {profile.skills.length > 0 ? (
                <div className="space-y-3">
                  {displayedSkills.map((skill) => (
                    <div key={skill.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{skill.skill_name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {skill.proficiency === 'expert' ? t('graduate.profile.skill.expert') : skill.proficiency === 'advanced' ? t('graduate.profile.skill.advanced') : skill.proficiency === 'intermediate' ? t('graduate.profile.skill.intermediate') : t('graduate.profile.skill.beginner')}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${skill.proficiency === 'expert' ? 95 : skill.proficiency === 'advanced' ? 80 : skill.proficiency === 'intermediate' ? 60 : 40}%`,
                            background: skill.proficiency === 'expert' || skill.proficiency === 'advanced'
                              ? 'linear-gradient(to right, #0a66c2, #06b6d4)'
                              : skill.proficiency === 'intermediate'
                              ? 'linear-gradient(to right, #0a66c2, #60a5fa)'
                              : 'linear-gradient(to right, #94a3b8, #cbd5e1)'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t('graduate.profile.no_skills')}</p>
              )}
              {profile.skills.length > 5 && (
                <button
                  onClick={() => setShowAllSkills(!showAllSkills)}
                  className="mt-3 text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1"
                >
                  {showAllSkills ? t('see_less') : `+${profile.skills.length - 5} ${t('skills')}`}
                  <ChevronRight className={`w-4 h-4 transition-transform ${showAllSkills ? 'rotate-90' : ''}`} />
                </button>
              )}
            </ProfileSection>

            {/* Certifications */}
            <ProfileSection title={t('certifications')} icon={Award}>
              {certifications.length > 0 ? (
                <div className="space-y-3">
                  {certifications.map((cert) => (
                    <div key={cert.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-navy-800/50">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                        <Award className="w-4 h-4 text-amber-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{cert.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{cert.issuer} • {cert.issue_date}</p>
                        {cert.credential_id && <p className="text-xs text-primary-500 mt-0.5">{cert.credential_id}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t('graduate.profile.no_certifications')}</p>
              )}
            </ProfileSection>

            {/* Languages */}
            <ProfileSection title={t('language')} icon={Globe}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">العربية</span>
                  <span className="text-xs badge-success">لغة أم</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">الإنجليزية</span>
                  <span className="text-xs badge-primary">متقدم</span>
                </div>
              </div>
            </ProfileSection>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
