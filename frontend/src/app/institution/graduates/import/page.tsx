'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import DashboardLayout from '@/components/DashboardLayout'
import {
  Loader2, ArrowLeft, Upload, FileSpreadsheet, AlertCircle,
  CheckCircle, Download, X,
} from 'lucide-react'
import { useTranslation } from '@/i18n'
import api from '@/lib/api'

export default function ImportGraduatesPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [csvData, setCsvData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null); setResult(null)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const lines = text.split('\n').filter((l) => l.trim())
      if (lines.length < 2) {
        setError('CSV must have a header row and at least one data row')
        return
      }
      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
      const required = ['student_id', 'full_name', 'major', 'enrollment_year']
      const missing = required.filter((r) => !headers.includes(r))
      if (missing.length > 0) {
        setError(`Missing required columns: ${missing.join(', ')}`)
        return
      }
      const rows = lines.slice(1).map((line) => {
        const vals = line.split(',').map((v) => v.trim())
        const row: any = {}
        headers.forEach((h, i) => { row[h] = vals[i] || '' })
        return row
      })
      setCsvData(rows)
    }
    reader.readAsText(file)
  }

  const importData = async () => {
    setImporting(true); setError(null)
    try {
      const res = await api.post('/institution/graduates/import_csv/', csvData)
      setResult(res.data)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  return (
    <DashboardLayout role="institution">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => router.push('/institution/graduates')} className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-primary-500 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {t('institution.graduates.back')}
        </button>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('institution.graduates.import')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{t('institution.graduates.import_desc')}</p>

        <div className="glass-card p-6 mb-6">
          <div className="border-2 border-dashed border-gray-300 dark:border-navy-600 rounded-xl p-12 text-center">
            <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />
            {csvData.length === 0 ? (
              <div>
                <Upload className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">{t('institution.graduates.import_drop')}</p>
                <button onClick={() => fileRef.current?.click()} className="btn-primary">
                  {t('institution.graduates.import_select')}
                </button>
                <div className="mt-4 text-xs text-gray-400">
                  <p>Required: student_id, full_name, major, enrollment_year</p>
                  <p>Optional: college, graduation_year, gpa, status</p>
                </div>
              </div>
            ) : (
              <div>
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {csvData.length} {t('institution.graduates.import_rows')}
                </p>
                <div className="max-h-40 overflow-y-auto mb-4">
                  <table className="w-full text-xs text-right">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-navy-700">
                        {Object.keys(csvData[0]).map((h) => (
                          <th key={h} className="p-2 font-semibold text-gray-500 dark:text-gray-400">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.slice(0, 5).map((row, i) => (
                        <tr key={i} className="border-b border-gray-100 dark:border-navy-700">
                          {Object.values(row).map((v: any, j) => (
                            <td key={j} className="p-2 text-gray-700 dark:text-gray-300">{v}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => { setCsvData([]); setResult(null) }} className="btn-ghost">{t('cancel')}</button>
                  <button onClick={importData} disabled={importing} className="btn-primary flex items-center gap-2">
                    {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {importing ? t('importing') : t('institution.graduates.import_confirm')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 mb-6">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {result && (
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('institution.graduates.import_result')}</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-center">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{result.created}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{t('institution.graduates.import_created')}</div>
              </div>
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-center">
                <Download className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{result.updated}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{t('institution.graduates.import_updated')}</div>
              </div>
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-center">
                <X className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{result.errors?.length || 0}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{t('institution.graduates.import_errors')}</div>
              </div>
            </div>
            {result.errors?.length > 0 && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
                <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">{t('institution.graduates.import_errors_list')}</p>
                {result.errors.map((e: any, i: number) => (
                  <p key={i} className="text-xs text-red-500">Row {i + 1}: {e.error}</p>
                ))}
              </div>
            )}
            <button onClick={() => router.push('/institution/graduates')} className="btn-primary mt-4">
              {t('institution.graduates.back')}
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
