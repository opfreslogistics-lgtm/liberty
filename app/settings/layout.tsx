import { AppLayout } from '@/components/layout/AppLayout'
import { AuthGuard } from '@/components/auth/AuthGuard'

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard requireAuth={true} redirectTo="/">
      <AppLayout>{children}</AppLayout>
    </AuthGuard>
  )
}

