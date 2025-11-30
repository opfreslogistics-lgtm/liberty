import { AuthGuard } from '@/components/auth/AuthGuard'

export default function WireTransferLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard requireAuth={true} redirectTo="/">
      {children}
    </AuthGuard>
  )
}

