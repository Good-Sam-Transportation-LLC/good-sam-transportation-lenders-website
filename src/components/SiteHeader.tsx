import { useState } from "react";
import type React from "react";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Financials", href: "#financials" },
  { label: "Market", href: "#market" },
  { label: "Fleet", href: "#fleet" },
  { label: "Investment", href: "#investment" },
  { label: "Contact", href: "#contact" },
];

const SiteHeader = () => {
  const [open, setOpen] = useState(false);

  const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href || href[0] !== "#") {
      return;
    }

    event.preventDefault();

    const targetId = href.slice(1);
    const targetElement = typeof document !== "undefined" ? document.getElementById(targetId) : null;

    // Header height is h-16 (4rem), which is 64px with a base font size of 16px.
    const HEADER_OFFSET = 64;

    if (targetElement && typeof window !== "undefined") {
      const rect = targetElement.getBoundingClientRect();
      const scrollTop = window.scrollY + rect.top - HEADER_OFFSET;

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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="section-container flex h-16 items-center justify-between">
        <a href="#" className="text-sm font-semibold tracking-tight text-foreground">
          GOOD SAM<span className="text-gold">.</span>
        </a>

        {/* Desktop */}
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
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
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border bg-background px-6 pb-6 pt-4 md:hidden">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={(event) => handleNavClick(event, l.href)}
              className="block py-2 text-sm text-muted-foreground"
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
};

export default SiteHeader;
