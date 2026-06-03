'use client'

import DashboardLayout from '@/components/DashboardLayout'
import ChatMessages from '@/components/ChatMessages'

export default function GraduateMessagesPage() {
  return (
    <DashboardLayout role="graduate">
      <ChatMessages role="graduate" />
    </DashboardLayout>
  )
}
