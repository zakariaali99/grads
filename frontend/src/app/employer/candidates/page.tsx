'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import DashboardLayout from '@/components/DashboardLayout'
import {
  Search, MapPin, BookmarkPlus, MessageSquare, Filter,
  GraduationCap, Award, ArrowUpDown, AlertCircle,
  Loader2, Users,
} from 'lucide-react'
import { graduateService } from '@/lib/api-services'
import type { GraduateProfile } from '@/lib/types'
import { useTranslation } from '@/i18n'

export default function CandidatesPage() {
  const { t } = useTranslation()
  const { isAuthenticated, isLoading: authLoading, fetchProfile } = useAuthStore()
  const router = useRouter()

  const sortOptions = [t('best_match'), t('newest'), t('oldest')]

  const [candidates, setCandidates] = useState<GraduateProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [skillFilter, setSkillFilter] = useState('')
  const [sortBy, setSortBy] = useState(t('best_match'))
  const [savedIds, setSavedIds] = useState<string[]>([])

  useEffect(() => {
    fetchProfile()
  }, [])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) fetchCandidates()
  }, [isAuthenticated])

  const fetchCandidates = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await graduateService.listProfiles({ page_size: 50 })
      setCandidates(data.results || [])
    } catch {
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }

  const toggleSave = (id: string) => {
    setSavedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id])
  }

  const filtered = [...candidates]
    .filter((c) => {
      const name = c.user?.full_name || ''
      const headline = c.headline || ''
      if (search && !name.includes(search) && !headline.includes(search)) return false
      if (skillFilter) {
        const skillNames = c.skills?.map((s) => s.skill_name?.toLowerCase()) || []
        if (!skillNames.some((s) => s.includes(skillFilter.toLowerCase()))) return false
      }
      return true
    })
    .sort((a, b) => {
      const yearA = a.graduation_year || 0
      const yearB = b.graduation_year || 0
      if (sortBy === t('newest')) return yearB - yearA
      if (sortBy === t('oldest')) return yearA - yearB
      return (b.skills?.length || 0) - (a.skills?.length || 0)
    })

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <DashboardLayout role="employer">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('employer.candidates.title')}</h1>
      </div>

      <div className="glass-card p-5 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('employer.candidates.search_placeholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pr-12"
            />
          </div>
          <div className="relative">
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('skill_placeholder')}
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="input-field pr-10 py-2.5 w-40"
            />
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field py-2.5 w-36"
            >
              {sortOptions.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
          <button onClick={fetchCandidates} className="btn-secondary mt-4">{t('retry')}</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">{t('employer.candidates.empty')}</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{t('employer.candidates.empty_hint')}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((candidate) => {
            const name = candidate.user?.full_name || t('unspecified')
            const initial = name[0] || '?'
            const skillNames = candidate.skills?.map((s) => s.skill_name) || []
            const skillCount = skillNames.length
            return (
              <div key={candidate.id} className="glass-card p-5 card-hover flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg">
                      {initial}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{candidate.headline || t('no_headline')}</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary-500">
                      {skillCount}
                    </div>
                    <div className="text-xs text-gray-400">{t('employer.candidates.skill_count')}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {skillNames.slice(0, 5).map((s) => (
                    <span key={s} className="badge-primary text-xs">{s}</span>
                  ))}
                  {skillNames.length > 5 && (
                    <span className="text-xs text-gray-400 self-center">+{skillNames.length - 5}</span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {candidate.city || t('unspecified')}
                  </span>
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5" />
                    {candidate.college_name || candidate.college || t('unspecified')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    {candidate.graduation_year || '--'}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => toggleSave(candidate.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      savedIds.includes(candidate.id)
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                        : 'btn-secondary'
                    }`}
                  >
                    <BookmarkPlus className="w-4 h-4" />
                    {savedIds.includes(candidate.id) ? t('saved') : t('save')}
                  </button>
                  <button className="flex-1 btn-primary flex items-center justify-center gap-2 py-2.5">
                    <MessageSquare className="w-4 h-4" />
                    {t('employer.candidates.message')}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </DashboardLayout>
  )
}
