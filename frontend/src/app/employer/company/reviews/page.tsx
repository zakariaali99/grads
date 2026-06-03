'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import DashboardLayout from '@/components/DashboardLayout'
import {
  Star, ThumbsUp, ThumbsDown, Clock, Loader2,
  AlertCircle, MessageSquareText, Filter,
} from 'lucide-react'
import { employerService } from '@/lib/api-services'
import type { CompanyReview } from '@/lib/types'
import { useTranslation } from '@/i18n'

export default function CompanyReviewsPage() {
  const { t } = useTranslation()
  const { isAuthenticated, isLoading: authLoading, fetchProfile } = useAuthStore()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reviews, setReviews] = useState<CompanyReview[]>([])
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [ratingFilter, setRatingFilter] = useState<number | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) fetchCompanyAndReviews()
  }, [isAuthenticated]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCompanyAndReviews = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: company } = await employerService.getMyCompany()
      setCompanyId(company.id)
      const { data: reviewsData } = await employerService.getReviews(company.id)
      const results = Array.isArray(reviewsData) ? reviewsData : reviewsData?.results ?? []
      setReviews(results)
    } catch (err: any) {
      if (err?.response?.status === 404) {
        router.push('/employer/company')
        return
      }
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await employerService.approveReview(id)
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_approved: true } : r))
      )
    } catch {
      setError(t('error'))
    }
  }

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

  const distribution = [5, 4, 3, 2, 1].map(
    (star) => reviews.filter((r) => r.rating === star).length
  )

  const filteredReviews = ratingFilter
    ? reviews.filter((r) => r.rating === ratingFilter)
    : reviews

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <DashboardLayout role="employer">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="section-title">{t('reviews.title')}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{reviews.length} {t('reviews.rating')}</p>
          </div>
        </div>

        {error && (
          <div className="p-4 mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        )}

        {!loading && reviews.length === 0 && (
          <div className="glass-card p-12 text-center">
            <MessageSquareText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('reviews.no_reviews')}</h3>
          </div>
        )}

        {!loading && reviews.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="glass-card p-5 text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {averageRating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(averageRating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('reviews.average')}</p>
              </div>

              <div className="glass-card p-5 lg:col-span-3">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{t('reviews.distribution')}</h4>
                <div className="space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = distribution[5 - star]
                    const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                    return (
                      <div key={star} className="flex items-center gap-2 text-sm">
                        <span className="w-4 text-gray-500 dark:text-gray-400 text-xs">{star}</span>
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <div className="flex-1 h-3 bg-gray-100 dark:bg-navy-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-6 text-right text-xs text-gray-500 dark:text-gray-400">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-gray-400" />
              {[null, 5, 4, 3, 2, 1].map((val) => (
                <button
                  key={val ?? 'all'}
                  onClick={() => setRatingFilter(val)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    ratingFilter === val
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-white dark:bg-navy-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-primary-300'
                  }`}
                >
                  {val ?? t('all')}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredReviews.map((review) => (
                <div key={review.id} className="glass-card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
                          {(review.graduate_name || t('reviews.anonymous'))[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {review.graduate_name || t('reviews.anonymous')}
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3.5 h-3.5 ${
                                    star <= review.rating
                                      ? 'text-amber-400 fill-amber-400'
                                      : 'text-gray-300 dark:text-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      {review.review && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mt-1">
                          {review.review}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {review.is_approved ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full">
                          <ThumbsUp className="w-3 h-3" />
                          {t('reviews.approve')}
                        </span>
                      ) : (
                        <>
                          <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-full">
                            <Clock className="w-3 h-3" />
                            {t('reviews.pending')}
                          </span>
                          <button
                            onClick={() => handleApprove(review.id)}
                            className="btn-primary text-xs py-1.5 px-3"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            {t('reviews.approve')}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {filteredReviews.length === 0 && (
                <div className="glass-card p-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400">{t('no_results')}</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
