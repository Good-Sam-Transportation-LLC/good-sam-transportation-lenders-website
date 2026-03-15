const SiteFooter = () => (
  <footer className="border-t border-border py-12">
    <div className="section-container flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
      <div>
        <p className="text-sm font-semibold text-foreground">
          GOOD SAM<span className="text-gold">.</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Premium Transportation — Investor Relations
        </p>
      </div>
      <p className="text-xs text-muted-foreground">
        © {new Date().getFullYear()} Good Sam Transportation. All rights reserved.
      </p>
    </div>
  </footer>
);

export default SiteFooter;
