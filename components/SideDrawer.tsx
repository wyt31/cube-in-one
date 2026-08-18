"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MENU_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Algorithms", href: "/algs" },
  { label: "Timer", href: "/timer" },
  { label: "About", href: "/about" },
  { label: "Case Library", href: "/#" },
  { label: "Settings", href: "/#" },
];

type SideDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function SideDrawer({ isOpen, onClose }: SideDrawerProps) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-[#333]/10 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-72 flex-col border-l border-[#E8E2D9] bg-[#FDFDFC] shadow-[-8px_0_32px_rgba(51,51,51,0.06)] transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <span className="text-[0.65rem] uppercase tracking-[0.3em] text-[#666]">
            Menu
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="text-[#999] transition-colors hover:text-[#333]"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path
                d="M4 4L14 14M14 4L4 14"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col px-4">
          {MENU_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className={`rounded-xl px-4 py-3.5 text-sm tracking-wide transition-all ${
                  isActive
                    ? "bg-[#2C2C2C]/5 text-[#2C2C2C] font-medium"
                    : "text-[#444] hover:bg-[#F0EBE3]/60"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
