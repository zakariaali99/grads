import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Briefcase, Globe, Mail, Phone, Users, Verified, Building2 } from 'lucide-react'
import SchemaOrg from '@/components/SchemaOrg'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

async function getCompany(id: string) {
  try {
    const res = await fetch(`${API}/employers/companies/${id}/`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

async function getCompanyJobs(id: string) {
  try {
    const res = await fetch(`${API}/jobs/posts/?company=${id}&status=active`, { next: { revalidate: 60 } })
    if (!res.ok) return []
    const data = await res.json()
    return data.results || data
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const company = await getCompany(params.id)
  if (!company) return { title: 'الشركة غير موجودة - خريجون' }

  const title = company.company_name
  const desc = company.description || company.industry_name || ''

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      type: 'website',
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/company/${params.id}`,
      images: company.logo ? [{ url: company.logo }] : [],
    },
    twitter: { card: 'summary', title, description: desc },
  }
}

export default async function PublicCompanyPage({ params }: { params: { id: string } }) {
  const company = await getCompany(params.id)
  if (!company) notFound()

  const jobs = await getCompanyJobs(params.id)

  const schemaOrg = {
    '@type': 'Organization',
    name: company.company_name,
    description: company.description,
    url: company.website,
    email: company.user?.email,
    image: company.logo,
    address: { '@type': 'PostalAddress', addressLocality: company.city, addressCountry: company.country },
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
      <SchemaOrg type="Organization" data={schemaOrg} />

      <header className="bg-white dark:bg-navy-800 border-b border-gray-200 dark:border-navy-700">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary-500">خريجون</Link>
          <nav className="flex items-center gap-4">
            <Link href="/search" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500">بحث</Link>
            <Link href="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500">تسجيل الدخول</Link>
            <Link href="/register" className="btn-primary text-sm py-1.5 px-4">إنشاء حساب</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-200 dark:border-navy-700 p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-purple-500 to-purple-300 flex items-center justify-center text-white text-3xl font-bold shrink-0 overflow-hidden">
              {company.logo ? (
                <Image src={company.logo} alt={company.company_name} width={96} height={96} className="object-cover" />
              ) : (
                company.company_name.charAt(0)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{company.company_name}</h1>
                {company.is_verified && (
                  <span className="flex items-center gap-1 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                    <Verified className="w-3 h-3" /> موثقة
                  </span>
                )}
              </div>
              {company.industry_name && <p className="text-gray-500 dark:text-gray-400 mt-1">{company.industry_name}</p>}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                {company.city && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {company.city}</span>}
                {company.company_size && <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {company.company_size}</span>}
                {company.total_jobs > 0 && <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {company.total_jobs} وظيفة</span>}
              </div>
            </div>
          </div>

          {company.description && (
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-navy-700">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{company.description}</p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-navy-700 text-sm">
            {company.website && (
              <a href={company.website} target="_blank" className="flex items-center gap-1 text-primary-500 hover:underline">
                <Globe className="w-4 h-4" /> الموقع الإلكتروني
              </a>
            )}
            {company.user?.email && (
              <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4" /> {company.user.email}
              </span>
            )}
            {company.phone && (
              <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4" /> {company.phone}
              </span>
            )}
          </div>
        </div>

        {jobs.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">الوظائف الشاغرة ({jobs.length})</h2>
            <div className="space-y-4">
              {jobs.map((job: any) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="block bg-white dark:bg-navy-800 rounded-xl shadow-sm border border-gray-200 dark:border-navy-700 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{job.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {job.city}{job.is_remote ? ' (عن بعد)' : ''} — {job.employment_type}
                      </p>
                    </div>
                    {job.salary_min && (
                      <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        {job.salary_min?.toLocaleString()} - {job.salary_max?.toLocaleString()} {job.salary_currency || 'LYD'}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {job.skills_list?.slice(0, 5).map((s: any) => (
                      <span key={s.id} className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-navy-900 text-gray-600 dark:text-gray-400">
                        {s.name_ar || s.name_en}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
