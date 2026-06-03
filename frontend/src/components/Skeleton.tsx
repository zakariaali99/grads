'use client'

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-gray-200 dark:bg-navy-700',
        className
      )}
    />
  )
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn('glass-card p-6 space-y-4', className)}>
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  )
}

export function SkeletonStatCard({ className }: SkeletonProps) {
  return (
    <div className={cn('stat-card p-4', className)}>
      <div className="flex items-center gap-4">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5, className }: SkeletonProps & { rows?: number }) {
  return (
    <div className={cn('glass-card p-6 space-y-4', className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-8 w-16 rounded-lg ml-auto" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonList({ items = 4, className }: SkeletonProps & { items?: number }) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-navy-800">
          <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-3 w-2/5" />
          </div>
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      ))}
    </div>
  )
}
