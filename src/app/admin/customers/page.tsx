import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Customers</h1>
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b">
            <tr>
              <th className="text-left p-3 font-medium">Name</th>
              <th className="text-left p-3 font-medium">Email</th>
              <th className="text-center p-3 font-medium">Orders</th>
              <th className="text-left p-3 font-medium hidden sm:table-cell">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {customers.map(c => (
              <tr key={c.id} className="hover:bg-neutral-50">
                <td className="p-3 font-medium">{c.name || '-'}</td>
                <td className="p-3 text-neutral-500">{c.email}</td>
                <td className="p-3 text-center">{c._count.orders}</td>
                <td className="p-3 text-neutral-500 hidden sm:table-cell text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && <p className="p-8 text-center text-neutral-500">No customers yet</p>}
      </div>
    </div>
  )
}
