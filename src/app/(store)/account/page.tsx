import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Package, Heart, MapPin, AlertTriangle } from 'lucide-react'
import ResendVerificationButton from './resend-verification-button'

export const metadata = { title: 'My Account | Luxury Beauty ZM' }

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login?callbackUrl=/account')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { emailVerified: true },
  })

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-neutral-900 mb-2">My Account</h1>
      <p className="text-neutral-500 mb-8">Welcome back, {session.user.name || 'there'}</p>
      {!user?.emailVerified && (
        <div className="flex items-center justify-between gap-4 rounded-sm border border-amber-200 bg-amber-50 p-4 mb-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0" />
            <p className="text-sm text-amber-800">Your email is not verified. Please check your inbox or request a new verification link.</p>
          </div>
          <ResendVerificationButton email={session.user.email!} />
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { title: 'My Orders', desc: 'Track and manage your orders', href: '/account/orders', icon: Package },
          { title: 'Wishlist', desc: 'Products you\'ve saved', href: '/account/wishlist', icon: Heart },
          { title: 'Addresses', desc: 'Manage delivery addresses', href: '/account/addresses', icon: MapPin },
        ].map(item => (
          <Link key={item.href} href={item.href} className="flex items-center gap-4 p-5 border rounded-sm hover:bg-neutral-50 transition-colors">
            <item.icon className="h-8 w-8 text-amber-800" />
            <div>
              <h3 className="font-medium text-neutral-900">{item.title}</h3>
              <p className="text-sm text-neutral-500">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
