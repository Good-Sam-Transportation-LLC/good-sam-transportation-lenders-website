import { useState } from "react";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/motion";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Market", href: "#market" },
  { label: "Financials", href: "#financials" },
  { label: "Fleet", href: "#fleet" },
  { label: "Investment", href: "#investment" },
  { label: "Contact", href: "#contact" },
];

const SiteHeader = () => {
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
    >
      <div className="container flex h-16 items-center justify-between">
        <a href="#" className="font-serif text-xl tracking-wide text-foreground">
          Good Sam <span className="text-primary">Transportation</span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contact"
            className="rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Request Pitch Deck
          </a>
        </nav>

        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-6 pb-6 pt-4 md:hidden">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-2 text-sm text-muted-foreground"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setOpen(false)}
            className="mt-3 block rounded-sm bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground"
          >
            Request Pitch Deck
          </a>
        </div>
      )}
    </motion.header>
  );
};

export default SiteHeader;
