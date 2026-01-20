import Link from "next/link";
import { ShoppingBag, Twitter, Instagram, Facebook, Github } from "lucide-react";

const footerLinks = {
  Shop: [
    { label: "All Products", href: "/shop" },
    { label: "New Arrivals", href: "/shop?sort=newest" },
    { label: "Sale", href: "/shop?sort=price-asc" },
    { label: "Featured", href: "/shop?sort=featured" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
  ],
  Support: [
    { label: "FAQ", href: "/faq" },
    { label: "Shipping Policy", href: "/shipping" },
    { label: "Returns", href: "/returns" },
    { label: "Track Order", href: "/account/orders" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Github, href: "#", label: "GitHub" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 xl:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900">
                <ShoppingBag className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                Luxe<span className="text-blue-600">Store</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              Curated products for the modern lifestyle. Quality you can trust,
              style you'll love.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-900 hover:text-white transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Nav Links */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-900 mb-4">
                {group}
              </h3>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} LuxeStore. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="flex h-5 w-8 items-center justify-center rounded bg-gray-200 text-[10px] font-bold text-gray-600">VISA</span>
              <span className="flex h-5 w-8 items-center justify-center rounded bg-gray-200 text-[10px] font-bold text-gray-600">MC</span>
              <span className="flex h-5 w-8 items-center justify-center rounded bg-gray-200 text-[10px] font-bold text-gray-600">AMEX</span>
              <span className="flex h-5 items-center justify-center rounded bg-blue-600 px-1.5 text-[10px] font-bold text-white">Stripe</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
