'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { socialService, type SocialProfile } from '@/lib/api-services'
import type { Post, PaginatedResponse } from '@/lib/types'
import {
  Loader2, ArrowRight, UserPlus, UserCheck, Users, MessageSquare,
  Heart, ThumbsUp, Sparkles, Handshake, Lightbulb, HeartHandshake,
  EyeOff, Trash2, MessageCircle, AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/i18n'

const REACTION_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  like: { icon: ThumbsUp, color: 'text-blue-500' },
  celebrate: { icon: Sparkles, color: 'text-yellow-500' },
  support: { icon: Handshake, color: 'text-green-500' },
  insightful: { icon: Lightbulb, color: 'text-purple-500' },
  love: { icon: Heart, color: 'text-red-500' },
}

export default function SocialProfilePage() {
  const { t } = useTranslation()
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading, fetchProfile } = useAuthStore()
  const userId = params?.userId as string

  const [profile, setProfile] = useState<SocialProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState('')
  const [posts, setPosts] = useState<Post[]>([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [followLoading, setFollowLoading] = useState(false)

  useEffect(() => { fetchProfile() }, [])
  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated])

  const loadProfile = useCallback(async () => {
    if (!userId) return
    try {
      setProfileLoading(true)
      setProfileError('')
      const { data } = await socialService.getProfile(userId)
      setProfile(data)
    } catch {
      setProfileError(t('error'))
    } finally {
      setProfileLoading(false)
    }
  }, [userId, t])

  const loadPosts = useCallback(async () => {
    if (!userId) return
    try {
      setPostsLoading(true)
      const { data } = await socialService.getFeed({ author: userId, page_size: 50 })
      setPosts((data as any)?.results || [])
    } catch {
    } finally {
      setPostsLoading(false)
    }
  }, [userId])

  useEffect(() => { loadProfile() }, [loadProfile])
  useEffect(() => { loadPosts() }, [loadPosts])

  const handleFollow = async () => {
    if (!profile) return
    try {
      setFollowLoading(true)
      if (profile.is_following) {
        await socialService.unfollowUser(profile.id)
        setProfile({ ...profile, is_following: false, followers_count: Math.max(0, profile.followers_count - 1) })
      } else {
        await socialService.followUser(profile.id)
        setProfile({ ...profile, is_following: true, followers_count: profile.followers_count + 1 })
      }
    } catch {
    } finally {
      setFollowLoading(false)
    }
  }

  const handleDeletePost = async (postId: string) => {
    try {
      await socialService.deletePost(postId)
      setPosts((prev) => prev.filter((p) => p.id !== postId))
    } catch {}
  }

  const handleToggleLike = async (postId: string, reactionType: string) => {
    try {
      const { data } = await socialService.toggleLike(postId, reactionType)
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p
          if (data.liked) {
            return { ...p, user_reaction: reactionType, reactions_count: p.reactions_count + (p.user_reaction ? 0 : 1) }
          }
          const { user_reaction, ...rest } = p
          return { ...rest, reactions_count: Math.max(0, p.reactions_count - 1) }
        })
      )
    } catch {}
  }

  const timeAgo = (dateStr: string): string => {
    const now = new Date()
    const date = new Date(dateStr)
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (diff < 60) return t('now')
    if (diff < 3600) return `${Math.floor(diff / 60)} ${t('minutes_ago')}`
    if (diff < 86400) return `${Math.floor(diff / 3600)} ${t('hours_ago')}`
    return date.toLocaleDateString()
  }

  const typeOptions: Record<string, string> = {
    graduate: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    employer: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    admin: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    institution: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-navy-900 dark:to-navy-950">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-primary-500 mb-6 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          {t('back')}
        </button>

        {profileLoading ? (
          <div className="glass-card p-6 animate-pulse space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-navy-700" />
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-slate-200 dark:bg-navy-700 rounded w-1/3" />
                <div className="h-4 bg-slate-200 dark:bg-navy-700 rounded w-1/4" />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-10 bg-slate-200 dark:bg-navy-700 rounded-xl w-20" />
              <div className="h-10 bg-slate-200 dark:bg-navy-700 rounded-xl w-20" />
              <div className="h-10 bg-slate-200 dark:bg-navy-700 rounded-xl w-20" />
            </div>
          </div>
        ) : profileError ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertTriangle className="w-10 h-10 text-red-400 mb-3" />
            <p className="text-slate-500 dark:text-slate-400">{profileError}</p>
          </div>
        ) : profile ? (
          <>
            <div className="glass-card p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xl font-bold shrink-0 overflow-hidden">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt={profile.full_name} className="w-full h-full object-cover" />
                  ) : (
                    profile.full_name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">{profile.full_name}</h1>
                    <span className={cn('px-2 py-0.5 text-[10px] font-medium rounded-full', typeOptions[profile.user_type] || 'bg-slate-100 dark:bg-navy-700 text-slate-500')}>
                      {profile.user_type}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">@{profile.username}</p>

                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <Users className="w-4 h-4" />
                      <span className="font-medium">{profile.followers_count}</span>
                      <span className="text-slate-400">{t('followers')}</span>
                    </div>
                    <div className="text-slate-300 dark:text-slate-600">·</div>
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <UserPlus className="w-4 h-4" />
                      <span className="font-medium">{profile.following_count}</span>
                      <span className="text-slate-400">{t('following')}</span>
                    </div>
                    <div className="text-slate-300 dark:text-slate-600">·</div>
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <MessageSquare className="w-4 h-4" />
                      <span className="font-medium">{profile.posts_count}</span>
                      <span className="text-slate-400">{t('posts')}</span>
                    </div>
                  </div>
                </div>

                {!profile.is_own_profile && (
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={cn(
                      'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                      profile.is_following
                        ? 'bg-slate-100 dark:bg-navy-700 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500'
                        : 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm hover:shadow-md'
                    )}
                  >
                    {followLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : profile.is_following ? (
                      <UserCheck className="w-4 h-4" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                    {profile.is_following ? t('following') : t('follow')}
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('posts')}</h2>

              {postsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="glass-card p-5 animate-pulse space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-navy-700" />
                        <div className="space-y-1.5 flex-1">
                          <div className="h-4 bg-slate-200 dark:bg-navy-700 rounded w-1/4" />
                          <div className="h-3 bg-slate-200 dark:bg-navy-700 rounded w-1/6" />
                        </div>
                      </div>
                      <div className="h-4 bg-slate-200 dark:bg-navy-700 rounded w-full" />
                      <div className="h-4 bg-slate-200 dark:bg-navy-700 rounded w-2/3" />
                    </div>
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-500 dark:text-slate-400">{t('no_posts')}</p>
                </div>
              ) : (
                posts.map((post) => {
                  const reactionIcon = post.user_reaction ? REACTION_ICONS[post.user_reaction] : null
                  return (
                    <div key={post.id} className="glass-card p-5">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {post.author.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900 dark:text-white text-sm">{post.author.full_name}</span>
                            <span className="text-xs text-slate-400">@{post.author.username}</span>
                            <span className="text-[10px] text-slate-400">· {timeAgo(post.created_at)}</span>
                          </div>
                          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{post.content}</p>

                          <div className="flex items-center gap-4 mt-3">
                            <button
                              onClick={() => handleToggleLike(post.id, post.user_reaction === 'like' ? 'like' : 'like')}
                              className={cn(
                                'flex items-center gap-1 text-xs transition-colors',
                                post.user_reaction === 'like' ? 'text-blue-500' : 'text-slate-400 hover:text-blue-500'
                              )}
                            >
                              {reactionIcon ? (
                                <reactionIcon.icon className={cn('w-4 h-4', reactionIcon.color)} />
                              ) : (
                                <ThumbsUp className="w-4 h-4" />
                              )}
                              <span>{post.reactions_count || ''}</span>
                            </button>

                            <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-primary-500 transition-colors">
                              <MessageCircle className="w-4 h-4" />
                              <span>{post.comments_count || ''}</span>
                            </button>

                            {(post.author.id === user.id || user.user_type === 'admin') && (
                              <button
                                onClick={() => handleDeletePost(post.id)}
                                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-500 transition-colors ml-auto"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
