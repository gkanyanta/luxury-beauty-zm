import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <h3 className="text-lg font-light tracking-[0.15em] text-white mb-4">LUXURY BEAUTY <span className="font-medium">ZM</span></h3>
            <p className="text-sm leading-relaxed text-neutral-400">Zambia&apos;s destination for authentic international fragrances, K-Beauty, and premium skincare.</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-white tracking-wider uppercase mb-4">Shop</h4>
            <ul className="space-y-2.5">
              <li><Link href="/shop?category=fragrances" className="text-sm hover:text-white transition-colors">Fragrances</Link></li>
              <li><Link href="/shop?category=k-beauty" className="text-sm hover:text-white transition-colors">K-Beauty</Link></li>
              <li><Link href="/shop?category=skincare" className="text-sm hover:text-white transition-colors">Skincare</Link></li>
              <li><Link href="/shop?category=hair-products" className="text-sm hover:text-white transition-colors">Hair Products</Link></li>
              <li><Link href="/shop" className="text-sm hover:text-white transition-colors">All Products</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-white tracking-wider uppercase mb-4">Customer Care</h4>
            <ul className="space-y-2.5">
              <li><Link href="/account/orders" className="text-sm hover:text-white transition-colors">Track Order</Link></li>
              <li><a href="mailto:hello@luxurybeautyzm.com" className="text-sm hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-white tracking-wider uppercase mb-4">Get in Touch</h4>
            <ul className="space-y-2.5 text-sm">
              <li>Lusaka, Zambia</li>
              <li><a href="mailto:hello@luxurybeautyzm.com" className="hover:text-white transition-colors">hello@luxurybeautyzm.com</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-500">&copy; {new Date().getFullYear()} Luxury Beauty ZM. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-neutral-500">
          Developed by <a href="https://www.privtech.net" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-300 transition-colors">PrivTech Solutions Limited</a>
        </p>
      </div>
    </footer>
  )
}
