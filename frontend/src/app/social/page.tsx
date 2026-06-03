'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import DashboardLayout from '@/components/DashboardLayout'
import { socialService } from '@/lib/api-services'
import { Loader2, Heart, MessageCircle, Send, ThumbsUp, Sparkles, Handshake, Lightbulb, HeartHandshake, EyeOff, Trash2 } from 'lucide-react'
import type { Post, Comment, PaginatedResponse } from '@/lib/types'
import { useTranslation } from '@/i18n'
import { cn } from '@/lib/utils'

const REACTION_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  like: { icon: ThumbsUp, color: 'text-blue-500' },
  celebrate: { icon: Sparkles, color: 'text-yellow-500' },
  support: { icon: Handshake, color: 'text-green-500' },
  insightful: { icon: Lightbulb, color: 'text-purple-500' },
  love: { icon: Heart, color: 'text-red-500' },
}

function timeAgo(dateStr: string, t: (key: string) => string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return t('now')
  if (diff < 3600) return `${Math.floor(diff / 60)} ${t('minutes_ago')}`
  if (diff < 86400) return `${Math.floor(diff / 3600)} ${t('hours_ago')}`
  return date.toLocaleDateString()
}

export default function SocialFeedPage() {
  const { t, dir } = useTranslation()
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading, fetchProfile } = useAuthStore()

  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newPostContent, setNewPostContent] = useState('')
  const [posting, setPosting] = useState(false)
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})
  const [commentLoading, setCommentLoading] = useState<Record<string, boolean>>({})
  const [followStatus, setFollowStatus] = useState<Record<string, boolean>>({})
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchFeed = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (append) setLoadingMore(true)
      else setLoading(true)
      const res = await socialService.getFeed({ page: pageNum })
      const data = res.data as PaginatedResponse<Post>
      if (append) {
        setPosts(prev => [...prev, ...data.results])
      } else {
        setPosts(data.results)
      }
      setHasMore(!!data.next)
      setPage(pageNum)
      setError(null)
    } catch {
      if (!append) setError(t('error'))
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [t])

  useEffect(() => {
    fetchProfile()
  }, [])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && !authLoading) fetchFeed()
  }, [isAuthenticated, authLoading, fetchFeed])

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return
    setPosting(true)
    try {
      const res = await socialService.createPost({ content: newPostContent })
      setPosts(prev => [res.data, ...prev])
      setNewPostContent('')
    } catch {
      /* ignore */
    } finally {
      setPosting(false)
    }
  }

  const handleToggleLike = async (postId: string, reactionType: string) => {
    try {
      const res = await socialService.toggleLike(postId, reactionType)
      const { liked } = res.data
      setPosts(prev => prev.map(p => {
        if (p.id !== postId) return p
        return {
          ...p,
          user_reaction: liked ? reactionType : undefined,
          reactions_count: p.reactions_count + (liked ? 1 : -1),
        }
      }))
    } catch {
      /* ignore */
    }
  }

  const handleDeletePost = async (postId: string) => {
    try {
      await socialService.deletePost(postId)
      setPosts(prev => prev.filter(p => p.id !== postId))
    } catch {
      /* ignore */
    }
  }

  const toggleComments = async (postId: string) => {
    const newSet = new Set(expandedComments)
    if (newSet.has(postId)) {
      newSet.delete(postId)
      setExpandedComments(newSet)
      return
    }
    newSet.add(postId)
    setExpandedComments(newSet)
    if (!comments[postId]) {
      try {
        const res = await socialService.getComments(postId)
        setComments(prev => ({ ...prev, [postId]: res.data as Comment[] || [] }))
      } catch {
        setComments(prev => ({ ...prev, [postId]: [] }))
      }
    }
  }

  const handleAddComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim()
    if (!content) return
    setCommentLoading(prev => ({ ...prev, [postId]: true }))
    try {
      const res = await socialService.createComment(postId, { content, post: postId })
      setComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), res.data] }))
      setCommentInputs(prev => ({ ...prev, [postId]: '' }))
    } catch {
      /* ignore */
    } finally {
      setCommentLoading(prev => ({ ...prev, [postId]: false }))
    }
  }

  const handleToggleFollow = async (userId: string) => {
    try {
      if (followStatus[userId]) {
        await socialService.unfollowUser(userId)
        setFollowStatus(prev => ({ ...prev, [userId]: false }))
      } else {
        await socialService.followUser(userId)
        setFollowStatus(prev => ({ ...prev, [userId]: true }))
      }
    } catch {
      /* ignore */
    }
  }

  const loadMore = () => fetchFeed(page + 1, true)

  if (authLoading || !isAuthenticated) return null

  const userType = (user?.user_type || 'graduate') as 'graduate' | 'employer' | 'institution' | 'admin'

  return (
    <DashboardLayout role={userType}>
      <div className="max-w-2xl mx-auto space-y-6" dir={dir}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('nav.feed')}</h1>

        {/* Create Post Card */}
        <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {(user?.full_name || user?.username || 'U')[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <textarea
                value={newPostContent}
                onChange={e => setNewPostContent(e.target.value)}
                placeholder={t('feed.create_post')}
                className="w-full bg-gray-50 dark:bg-navy-700 rounded-xl px-4 py-3 text-sm resize-none border-0 focus:ring-0 focus:outline-none dark:text-gray-200 dark:placeholder-gray-400"
                rows={3}
                maxLength={5000}
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleCreatePost()
                }}
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-400">{newPostContent.length}/5000</span>
                <button
                  onClick={handleCreatePost}
                  disabled={!newPostContent.trim() || posting}
                  className={cn(
                    "px-6 py-2 rounded-xl text-sm font-medium transition-all",
                    newPostContent.trim() && !posting
                      ? "bg-primary-500 hover:bg-primary-600 text-white shadow-sm"
                      : "bg-gray-100 dark:bg-navy-700 text-gray-400 cursor-not-allowed"
                  )}
                >
                  {posting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : t('feed.post')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 text-center border border-red-100 dark:border-red-800/30">
            <EyeOff className="w-12 h-12 mx-auto text-red-400 mb-3" />
            <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
            <button onClick={() => fetchFeed()} className="mt-3 text-sm text-red-500 hover:underline">{t('retry')}</button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && posts.length === 0 && (
          <div className="bg-white dark:bg-navy-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-700/50">
            <MessageCircle className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('feed.no_posts')}</h3>
            <p className="text-sm text-gray-400 dark:text-gray-500">Follow other users to see their posts here</p>
          </div>
        )}

        {/* Posts Feed */}
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden">
              {/* Post Header */}
              <div className="flex items-center justify-between p-4 pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {(post.author.full_name || post.author.username || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{post.author.full_name || post.author.username}</span>
                      <span className="text-xs text-gray-400">@{post.author.username}</span>
                      {post.author.id !== user?.id && (
                        <button
                          onClick={() => handleToggleFollow(post.author.id)}
                          className={cn(
                            "text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors",
                            followStatus[post.author.id]
                              ? "border-primary-300 text-primary-600 dark:border-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20"
                              : "border-gray-300 text-gray-500 dark:border-gray-600 dark:text-gray-400 hover:border-primary-300 hover:text-primary-600"
                          )}
                        >
                          {followStatus[post.author.id] ? t('feed.following') : t('feed.follow')}
                        </button>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">{timeAgo(post.created_at, t)}</span>
                  </div>
                </div>
                {post.author.id === user?.id && (
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Post Content */}
              <div className="px-4 py-2">
                <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">{post.content}</p>
              </div>

              {post.image && (
                <div className="px-4 pb-2">
                  <img src={post.image} alt="" className="rounded-xl w-full object-cover max-h-96" />
                </div>
              )}

              {/* Post Stats */}
              <div className="px-4 py-2 flex items-center gap-4 text-xs text-gray-400 border-t border-gray-50 dark:border-gray-700/30">
                <span>{post.reactions_count} {t('feed.like')}{post.reactions_count !== 1 ? 's' : ''}</span>
                <button onClick={() => toggleComments(post.id)} className="hover:text-primary-500 transition-colors">
                  {post.comments_count} {t('feed.comment')}{post.comments_count !== 1 ? 's' : ''}
                </button>
              </div>

              {/* Reaction Bar */}
              <div className="px-4 py-2 border-t border-gray-50 dark:border-gray-700/30">
                <div className="flex items-center gap-1">
                  {Object.entries(REACTION_ICONS).map(([type, { icon: Icon, color }]) => {
                    const isActive = post.user_reaction === type
                    return (
                      <button
                        key={type}
                        onClick={() => handleToggleLike(post.id, type)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                          isActive
                            ? `${color} bg-gray-100 dark:bg-navy-700`
                            : "text-gray-400 hover:bg-gray-50 dark:hover:bg-navy-700 dark:text-gray-500"
                        )}
                      >
                        <Icon className={cn("w-4 h-4", isActive && "fill-current")} />
                        <span className="capitalize">{type}</span>
                      </button>
                    )
                  })}
                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:bg-gray-50 dark:hover:bg-navy-700 dark:text-gray-500 transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{t('feed.comment')}</span>
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              {expandedComments.has(post.id) && (
                <div className="border-t border-gray-50 dark:border-gray-700/30 px-4 py-3 space-y-3">
                  {/* Comment Input */}
                  <div className="flex items-center gap-2">
                    <input
                      value={commentInputs[post.id] || ''}
                      onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                      placeholder={t('feed.write_comment')}
                      className="flex-1 bg-gray-50 dark:bg-navy-700 rounded-xl px-4 py-2 text-sm border-0 focus:ring-0 focus:outline-none dark:text-gray-200 dark:placeholder-gray-400"
                      maxLength={2000}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAddComment(post.id)
                      }}
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      disabled={!commentInputs[post.id]?.trim() || commentLoading[post.id]}
                      className="p-2 rounded-xl text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 disabled:opacity-50 transition-colors"
                    >
                      {commentLoading[post.id]
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Send className="w-4 h-4" />
                      }
                    </button>
                  </div>

                  {/* Comments List */}
                  {(comments[post.id] || []).map(comment => (
                    <div key={comment.id} className="flex items-start gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-300 to-accent-300 flex items-center justify-center text-white font-bold text-[10px] shrink-0 mt-0.5">
                        {(comment.author.full_name || comment.author.username || 'U')[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="bg-gray-50 dark:bg-navy-700 rounded-xl px-3 py-2">
                          <span className="font-semibold text-xs text-gray-900 dark:text-gray-100">{comment.author.full_name || comment.author.username}</span>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{comment.content}</p>
                        </div>
                        <span className="text-[10px] text-gray-400 mt-0.5 block">{timeAgo(comment.created_at, t)}</span>
                      </div>
                    </div>
                  ))}

                  {(!comments[post.id] || comments[post.id].length === 0) && (
                    <p className="text-xs text-gray-400 text-center py-2">{t('feed.comment')}... {t('feed.write_comment')}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Load More */}
        {hasMore && !loading && (
          <div className="text-center py-4">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-8 py-2.5 rounded-xl text-sm font-medium bg-white dark:bg-navy-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-navy-700 transition-colors shadow-sm"
            >
              {loadingMore ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : t('see_more')}
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
