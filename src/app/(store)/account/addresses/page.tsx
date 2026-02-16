import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const metadata = { title: 'My Addresses | Luxury Beauty ZM' }

export const dynamic = 'force-dynamic'

export default async function AddressesPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login?callbackUrl=/account/addresses')

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: { isDefault: 'desc' },
  })

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-neutral-900 mb-8">My Addresses</h1>
      {addresses.length === 0 ? (
        <p className="text-neutral-500 text-center py-12">No saved addresses. Addresses are saved during checkout.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map(addr => (
            <div key={addr.id} className={`border rounded-sm p-4 ${addr.isDefault ? 'border-amber-800' : ''}`}>
              {addr.isDefault && <span className="text-xs text-amber-800 font-medium">Default</span>}
              <p className="font-medium text-sm mt-1">{addr.label || 'Address'}</p>
              <p className="text-sm text-neutral-500 mt-1">{addr.addressLine1}</p>
              {addr.addressLine2 && <p className="text-sm text-neutral-500">{addr.addressLine2}</p>}
              <p className="text-sm text-neutral-500">{addr.town}, {addr.province}</p>
              {addr.phone && <p className="text-sm text-neutral-500">{addr.phone}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
