'use client'

import DashboardLayout from '@/components/DashboardLayout'
import ChatMessages from '@/components/ChatMessages'

export default function EmployerMessagesPage() {
  return (
    <DashboardLayout role="employer">
      <ChatMessages role="employer" />
    </DashboardLayout>
  )
}
