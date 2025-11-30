import { AdminLayout } from '@/components/layout/AdminLayout'
import { AuthGuard } from '@/components/auth/AuthGuard'

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard requireAuth={true} requireAdmin={true} redirectTo="/">
      <AdminLayout>{children}</AdminLayout>
    </AuthGuard>
  )
}

