import { useState, useRef, type MouseEvent } from "react";
import type React from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Market", href: "#market" },
  { label: "Financials", href: "#financials" },
  { label: "Fleet", href: "#fleet" },
  { label: "Investment", href: "#investment" },
  { label: "Contact", href: "#contact" },
];

const FIXED_HEADER_HEIGHT = 64;

const SiteHeader = () => {
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);

  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href || href[0] !== "#") {
      return;
    }

    event.preventDefault();

    const targetId = href.slice(1);
    const targetElement = typeof document !== "undefined" ? document.getElementById(targetId) : null;

    const headerOffset = headerRef.current?.offsetHeight ?? FIXED_HEADER_HEIGHT;

    if (targetElement && typeof window !== "undefined") {
      const rect = targetElement.getBoundingClientRect();
      const scrollTop = window.scrollY + rect.top - headerOffset;

      window.scrollTo({
        top: scrollTop,
        behavior: "smooth",
      });

      try {
        window.history.replaceState(null, "", href);
      } catch {
        window.location.hash = href;
      }
    }

    setOpen(false);
  };

  return (
    <header
      ref={headerRef}
      className="fixed inset-x-0 top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg"
    >
      <div className="section-container flex h-16 items-center justify-between">
        <a href="#" className="text-sm font-semibold tracking-tight text-foreground">
          GOOD SAM<span className="text-gold">.</span>
        </a>

        {/* Desktop */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(event) => handleNavClick(event, l.href)}
              className="text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={(event) => handleNavClick(event, "#contact")}
            className="rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-all hover:brightness-110"
          >
            Request Deck
          </a>
        </nav>

        {/* Mobile toggle */}
        <button
          className="text-foreground md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          id="mobile-menu"
          className="border-t border-border bg-background px-6 pb-6 pt-4 md:hidden"
        >
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={(event) => handleNavClick(event, l.href)}
              className="block py-2 text-sm text-muted-foreground"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={(event) => handleNavClick(event, "#contact")}
            className="mt-3 block rounded-sm bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground"
          >
            Request Pitch Deck
          </a>
        </div>
      )}
    </header>
  );
};

export default SiteHeader;
