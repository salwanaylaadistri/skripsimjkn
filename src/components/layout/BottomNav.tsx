"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Newspaper, CreditCard, HelpCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const TOP_LEVEL_ROUTES = ["/", "/berita", "/kartu", "/faq", "/profil"];

export default function BottomNav() {
  const pathname = usePathname();

  const isTopLevel = TOP_LEVEL_ROUTES.some((r) => pathname === r);
  if (!isTopLevel) return null;

  const isPemula = pathname.startsWith("/pemula");
  const isMahir = pathname.startsWith("/mahir");
  const homeHref = isMahir ? "/mahir" : "/";

  const leftItems = [
    { href: homeHref, icon: Home, label: "Home" },
    { href: "/berita", icon: Newspaper, label: "Berita" },
  ];

  const rightItems = [
    { href: "/faq", icon: HelpCircle, label: "FAQ" },
    { href: "/profil", icon: User, label: "Profil" },
  ];

  const isActive = (href: string) => {
    if (href === "/" || href === "/mahir") return pathname === href || (!isPemula && !isMahir && pathname === "/") || (isMahir && pathname === "/mahir");
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav className="bg-white border-t border-gray-100 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] shrink-0 relative z-10">
      <div className="flex items-end justify-around px-2 h-16">
        {leftItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-4 py-2",
                active ? "text-[#184087]" : "text-gray-400"
              )}
            >
              <Icon className="w-6 h-6" strokeWidth={active ? 2.5 : 1.5} />
              <span className={cn("text-[10px]", active && "font-semibold")}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Center floating Kartu button */}
        <Link href="/kartu" className="flex flex-col items-center gap-0.5">
          <div className="-mt-5 w-14 h-14 rounded-full bg-[#184087] flex items-center justify-center shadow-lg">
            <CreditCard className="w-7 h-7 text-white" strokeWidth={1.5} />
          </div>
          <span className="text-[10px] text-gray-400 pb-1">Kartu</span>
        </Link>

        {rightItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-4 py-2",
                active ? "text-[#184087]" : "text-gray-400"
              )}
            >
              <Icon className="w-6 h-6" strokeWidth={active ? 2.5 : 1.5} />
              <span className={cn("text-[10px]", active && "font-semibold")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}


