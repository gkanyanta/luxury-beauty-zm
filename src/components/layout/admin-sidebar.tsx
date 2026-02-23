'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, FolderOpen, ShoppingCart, CreditCard, BarChart3, Settings, Tag, Truck, Users, MessageSquare, LogOut, ChevronLeft, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Categories', href: '/admin/categories', icon: FolderOpen },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
  { name: 'Discounts', href: '/admin/discounts', icon: Tag },
  { name: 'Shipping', href: '/admin/shipping', icon: Truck },
  { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={cn('fixed inset-y-0 left-0 z-50 flex flex-col bg-neutral-900 text-white transition-all duration-300 lg:relative', collapsed ? 'w-16' : 'w-64')}>
      <div className="flex h-16 items-center justify-between px-4 border-b border-neutral-800">
        {!collapsed && <Link href="/admin" className="text-sm font-light tracking-[0.15em]">LUXURY BEAUTY <span className="font-medium">ZM</span></Link>}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded hover:bg-neutral-800 transition-colors">
          {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
            return (
              <li key={item.name}>
                <Link href={item.href}
                  className={cn('flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                    isActive ? 'bg-white/10 text-white' : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                  )} title={collapsed ? item.name : undefined}>
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="border-t border-neutral-800 p-2">
        <Link href="/" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-neutral-400 hover:bg-white/5 hover:text-white transition-colors">
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Back to Store</span>}
        </Link>
      </div>
    </aside>
  )
}
