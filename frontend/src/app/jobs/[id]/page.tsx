import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Briefcase, Building2, Calendar, DollarSign, Clock, Users, CheckCircle } from 'lucide-react'
import SchemaOrg from '@/components/SchemaOrg'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

async function getJob(id: string) {
  try {
    const res = await fetch(`${API}/jobs/posts/${id}/`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const job = await getJob(params.id)
  if (!job) return { title: 'الوظيفة غير موجودة - خريجون' }

  const c = job.company || {}
  const companyName = c.company_name || ''
  const title = `${job.title} — ${companyName}`
  const desc = `${job.title} في ${companyName} | ${job.city || ''} | ${job.employment_type || ''}`

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      type: 'website',
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/jobs/${params.id}`,
      images: c.logo ? [{ url: c.logo }] : [],
    },
    twitter: { card: 'summary_large_image', title, description: desc },
  }
}

export default async function PublicJobPage({ params }: { params: { id: string } }) {
  const job = await getJob(params.id)
  if (!job) notFound()

  const company = job.company || {}
  const companyName = company.company_name || ''
  const employmentTypes: Record<string, string> = {
    full_time: 'دوام كامل', part_time: 'دوام جزئي', contract: 'عقد', freelance: 'حر', remote: 'عن بعد', internship: 'تدريب',
  }
  const experienceLevels: Record<string, string> = {
    entry_level: 'مبتدئ', mid_level: 'متوسط', senior_level: 'متقدم', lead_level: 'قيادي',
  }

  const schemaJobPosting = {
    '@type': 'JobPosting',
    title: job.title,
    description: (job.description || '').replace(/<[^>]*>/g, ''),
    datePosted: job.published_at,
    validThrough: job.deadline,
    employmentType: (job.employment_type || '').toUpperCase(),
    hiringOrganization: {
      '@type': 'Organization',
      name: companyName,
      sameAs: company.website,
      logo: company.logo,
    },
    jobLocation: job.city ? {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressLocality: job.city },
    } : undefined,
    baseSalary: job.salary_min ? {
      '@type': 'MonetaryAmount',
      currency: job.salary_currency || 'LYD',
      value: {
        '@type': 'QuantitativeValue',
        minValue: job.salary_min,
        maxValue: job.salary_max,
        unitText: 'MONTH',
      },
    } : undefined,
    ...(job.experience_level ? { experienceRequirements: experienceLevels[job.experience_level] || job.experience_level } : {}),
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
      <SchemaOrg type="JobPosting" data={schemaJobPosting} />

      <header className="bg-white dark:bg-navy-800 border-b border-gray-200 dark:border-navy-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary-500">خريجون</Link>
          <nav className="flex items-center gap-4">
            <Link href="/search" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500">بحث</Link>
            <Link href="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500">تسجيل الدخول</Link>
            <Link href="/register" className="btn-primary text-sm py-1.5 px-4">إنشاء حساب</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/search" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 mb-4 inline-block">
          ← العودة للنتائج
        </Link>

        <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-200 dark:border-navy-700 p-8 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-purple-300 flex items-center justify-center text-white text-xl font-bold shrink-0">
              {companyName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{job.title}</h1>
              <Link href={`/company/${job.company}`} className="text-primary-500 hover:underline text-sm inline-flex items-center gap-1 mt-1">
                <Building2 className="w-4 h-4" /> {companyName}
                {company.is_verified && <CheckCircle className="w-3 h-3 text-emerald-500" />}
              </Link>
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
                {job.city && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.city}{job.is_remote ? ' (عن بعد)' : ''}</span>}
                {job.employment_type && <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {employmentTypes[job.employment_type] || job.employment_type}</span>}
                {job.experience_level && <span className="flex items-center gap-1">{experienceLevels[job.experience_level] || job.experience_level}</span>}
                {job.vacancies && <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {job.vacancies} شاغر</span>}
                {job.published_at && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(job.published_at).toLocaleDateString('ar')}</span>}
                {job.deadline && <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> آخر موعد: {new Date(job.deadline).toLocaleDateString('ar')}</span>}
              </div>
            </div>
            {job.salary_min && (
              <div className="text-left shrink-0">
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {job.salary_min?.toLocaleString()} - {job.salary_max?.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">{job.salary_currency || 'LYD'}/شهرياً</div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-200 dark:border-navy-700 p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">وصف الوظيفة</h2>
              <div
                className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: job.description || '' }}
              />
            </section>

            {job.skills_list?.length > 0 && (
              <section className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-200 dark:border-navy-700 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">المهارات المطلوبة</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills_list.map((s: any) => (
                    <span key={s.id} className="px-3 py-1 rounded-full text-sm bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                      {s.name_ar || s.name_en}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-200 dark:border-navy-700 p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">ملخص الوظيفة</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">الراتب</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {job.salary_min ? `${job.salary_min?.toLocaleString()} - ${job.salary_max?.toLocaleString()} ${job.salary_currency || 'LYD'}` : 'غير محدد'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">نوع العمل</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{employmentTypes[job.employment_type] || job.employment_type}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">مستوى الخبرة</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{experienceLevels[job.experience_level] || job.experience_level}</dd>
                </div>
                {job.vacancies && <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">عدد الشواغر</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{job.vacancies}</dd>
                </div>}
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">المشاهدات</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{job.views_count || 0}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">المتقدمون</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{job.applications_count || 0}</dd>
                </div>
              </dl>
            </div>

            <Link
              href={`/register?redirect=/jobs/${params.id}`}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              قدم الآن
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
