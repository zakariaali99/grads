import { MetadataRoute } from 'next'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    { url: SITE, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1.0 },
    { url: `${SITE}/login`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${SITE}/register`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${SITE}/search`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.7 },
    { url: `${SITE}/terms`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: `${SITE}/privacy`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
  ]

  try {
    const [gradRes, companyRes, jobRes] = await Promise.all([
      fetch(`${API}/graduates/profiles/?limit=1000`, { next: { revalidate: 3600 } }),
      fetch(`${API}/employers/companies/?limit=1000`, { next: { revalidate: 3600 } }),
      fetch(`${API}/jobs/posts/?limit=1000`, { next: { revalidate: 3600 } }),
    ])

    const graduates = gradRes.ok ? (await gradRes.json()).results || [] : []
    const companies = companyRes.ok ? (await companyRes.json()).results || [] : []
    const jobs = jobRes.ok ? (await jobRes.json()).results || [] : []

    const graduateRoutes = graduates.map((g: any) => ({
      url: `${SITE}/graduate/${g.user?.username || g.id}`,
      lastModified: g.updated_at ? new Date(g.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    const companyRoutes = companies.map((c: any) => ({
      url: `${SITE}/company/${c.id}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

    const jobRoutes = jobs.map((j: any) => ({
      url: `${SITE}/jobs/${j.id}`,
      lastModified: j.published_at ? new Date(j.published_at) : new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }))

    return [...staticRoutes, ...graduateRoutes, ...companyRoutes, ...jobRoutes]
  } catch {
    return staticRoutes
  }
}
