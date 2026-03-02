import Link from "next/link";

export function Sidebar() {
  const links = [
    { href: "/", label: "Overview" },
    { href: "/units", label: "Units" },
    { href: "/owners", label: "Owners" },
    { href: "/tenants", label: "Tenants" },
    { href: "/vehicles", label: "Vehicles" },
    { href: "/invoices", label: "Invoices" },
    { href: "/news", label: "News" },
  ];

  return (
    <aside className="w-64 bg-card border-r hidden md:flex flex-col">
      <div className="h-16 flex items-center px-6 border-b">
        <span className="font-bold text-lg tracking-tight">Rusun Harum</span>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
