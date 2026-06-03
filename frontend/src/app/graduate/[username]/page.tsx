import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Briefcase, GraduationCap, Mail, Globe, ExternalLink, Award, Download } from 'lucide-react'
import SchemaOrg from '@/components/SchemaOrg'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

async function getGraduate(username: string) {
  try {
    const res = await fetch(`${API}/graduates/profiles/by_username/?username=${username}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  const profile = await getGraduate(params.username)
  if (!profile) return { title: 'الملف الشخصي غير موجود - خريجون' }

  const user = profile.user
  const fullName = user.full_name || user.username
  const title = `${fullName} — ${profile.headline || profile.major || 'خريج'}`
  const description = `${fullName} | ${profile.college_name || ''} | ${profile.city || ''}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/graduate/${params.username}`,
      images: user.avatar ? [{ url: user.avatar }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function PublicGraduatePage({ params }: { params: { username: string } }) {
  const profile = await getGraduate(params.username)
  if (!profile) notFound()

  const u = profile.user
  const edu = profile.education || []
  const exp = profile.experience || []
  const skills = profile.skills || []
  const projects = profile.projects || []
  const certs = profile.certifications || []
  const fullName = u.full_name || u.username

  const schemaPerson = {
    '@type': 'Person',
    name: fullName,
    jobTitle: profile.headline || profile.current_position,
    alumniOf: profile.college_name,
    knowsAbout: skills.map((s: any) => s.skill_name),
    email: u.email,
    image: u.avatar,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/graduate/${params.username}`,
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
      <SchemaOrg type="Person" data={schemaPerson} />

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
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-300 flex items-center justify-center text-white text-3xl font-bold shrink-0">
              {fullName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{fullName}</h1>
              {profile.headline && <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">{profile.headline}</p>}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                {profile.city && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {profile.city}</span>}
                {profile.major && <span className="flex items-center gap-1"><GraduationCap className="w-4 h-4" /> {profile.major}</span>}
                {profile.college_name && <span className="flex items-center gap-1">{profile.college_name}</span>}
                {profile.current_position && <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {profile.current_position}</span>}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                href={`${API}/graduates/profiles/${profile.id}/download_cv/`}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" /> تحميل السيرة
              </Link>
            </div>
          </div>

          {u.bio && (
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-navy-700">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{u.bio}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {exp.length > 0 && (
              <section className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-200 dark:border-navy-700 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary-500" /> الخبرات
                </h2>
                <div className="space-y-4">
                  {exp.map((e: any) => (
                    <div key={e.id} className="border-r-2 border-primary-200 dark:border-primary-800 pr-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{e.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{e.company}{e.location ? ` — ${e.location}` : ''}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {e.start_date?.substring(0, 4) || ''} - {e.end_date?.substring(0, 4) || 'حتى الآن'}
                      </p>
                      {e.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{e.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {edu.length > 0 && (
              <section className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-200 dark:border-navy-700 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary-500" /> التعليم
                </h2>
                <div className="space-y-4">
                  {edu.map((e: any) => (
                    <div key={e.id}>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{e.degree} — {e.field_of_study}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{e.institution}</p>
                      <p className="text-xs text-gray-400">
                        {e.start_date?.substring(0, 4) || ''} - {e.end_date?.substring(0, 4) || 'حتى الآن'}
                        {e.grade ? ` | ${e.grade}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {projects.length > 0 && (
              <section className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-200 dark:border-navy-700 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary-500" /> المشاريع
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {projects.map((p: any) => (
                    <div key={p.id} className="p-4 rounded-xl bg-gray-50 dark:bg-navy-900">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{p.title}</h3>
                      {p.technologies && <p className="text-xs text-gray-500 mt-1">{p.technologies}</p>}
                      {p.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{p.description}</p>}
                      {p.url && (
                        <a href={p.url} target="_blank" className="text-xs text-primary-500 hover:underline mt-2 inline-flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" /> رابط
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="space-y-6">
            {u.email && (
              <section className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-200 dark:border-navy-700 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary-500" /> معلومات الاتصال
                </h2>
                <div className="space-y-3 text-sm">
                  {u.email && <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><Mail className="w-4 h-4" /> {u.email}</p>}
                  {u.phone && <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400">{u.phone}</p>}
                  {profile.linkedin_url && (
                    <a href={profile.linkedin_url} target="_blank" className="flex items-center gap-2 text-primary-500 hover:underline">
                      <Globe className="w-4 h-4" /> LinkedIn
                    </a>
                  )}
                  {profile.github_url && (
                    <a href={profile.github_url} target="_blank" className="flex items-center gap-2 text-primary-500 hover:underline">
                      <Globe className="w-4 h-4" /> GitHub
                    </a>
                  )}
                </div>
              </section>
            )}

            {skills.length > 0 && (
              <section className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-200 dark:border-navy-700 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary-500" /> المهارات
                </h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s: any) => (
                    <span key={s.id} className="px-3 py-1 rounded-full text-sm bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                      {s.skill_name}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {certs.length > 0 && (
              <section className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-200 dark:border-navy-700 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary-500" /> الشهادات
                </h2>
                <div className="space-y-3">
                  {certs.map((c: any) => (
                    <div key={c.id}>
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{c.name}</h3>
                      <p className="text-xs text-gray-500">{c.issuer}{c.issue_date ? ` — ${c.issue_date.substring(0, 4)}` : ''}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
