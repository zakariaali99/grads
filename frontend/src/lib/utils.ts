import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, pattern: string = 'dd MMMM yyyy') {
  return format(new Date(date), pattern, { locale: ar })
}

export function timeAgo(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ar })
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function truncate(text: string, length: number = 100): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'badge-warning',
    reviewed: 'badge-primary',
    shortlisted: 'badge-primary',
    interview: 'badge-success',
    accepted: 'badge-success',
    rejected: 'badge-danger',
    withdrawn: 'badge-warning',
    draft: 'badge-warning',
    active: 'badge-success',
    closed: 'badge-danger',
    filled: 'badge-success',
    paused: 'badge-warning',
  }
  return colors[status] || 'badge-warning'
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'قيد المراجعة',
    reviewed: 'تمت المراجعة',
    shortlisted: 'مدرج في القائمة',
    interview: 'مقابلة',
    accepted: 'مقبول',
    rejected: 'مرفوض',
    withdrawn: 'منسحب',
    draft: 'مسودة',
    active: 'منشورة',
    closed: 'مغلقة',
    filled: 'تم التوظيف',
    paused: 'موقفة',
    full_time: 'دوام كامل',
    part_time: 'دوام جزئي',
    freelance: 'حر',
    contract: 'عقد',
    internship: 'تدريب',
    remote: 'عن بعد',
    entry: 'مبتدئ',
    junior: 'مبتدئ مع خبرة',
    mid: 'متوسط',
    senior: 'كبير',
    lead: 'قائد فريق',
    executive: 'تنفيذي',
    beginner: 'مبتدئ',
    intermediate: 'متوسط',
    advanced: 'متقدم',
    expert: 'خبير',
  }
  return labels[status] || status
}

export function getSalaryDisplay(min: number | null, max: number | null, currency: string = 'LYD'): string {
  if (!min && !max) return 'غير محدد'
  if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`
  if (min) return `من ${min.toLocaleString()} ${currency}`
  return `حتى ${max!.toLocaleString()} ${currency}`
}
