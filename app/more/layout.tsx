import { AppLayout } from '@/components/layout/AppLayout'
import { AuthGuard } from '@/components/auth/AuthGuard'

export default function MoreLayout({
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

