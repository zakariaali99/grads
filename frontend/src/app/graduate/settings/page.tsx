'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import ChangePasswordModal from '@/components/ChangePasswordModal'
import DeleteAccountModal from '@/components/DeleteAccountModal'
import { useTranslation } from '@/i18n'
import { Lock, AlertTriangle } from 'lucide-react'

export default function GraduateSettingsPage() {
  const { t } = useTranslation()
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)

  return (
    <DashboardLayout role="graduate">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('settings')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('account_settings.description')}</p>
        </header>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Lock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('account_settings')}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('change_password')}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowChangePassword(true)}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                {t('change_password')}
              </button>
            </div>
          </div>

          <div className="glass-card p-6 border border-red-200 dark:border-red-900/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-red-600 dark:text-red-400">{t('delete_account')}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('delete_account.warning')}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-900/50">
              <button
                onClick={() => setShowDeleteAccount(true)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl font-medium transition-all inline-flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                {t('delete_account')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ChangePasswordModal isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} />
      <DeleteAccountModal isOpen={showDeleteAccount} onClose={() => setShowDeleteAccount(false)} />
    </DashboardLayout>
  )
}
