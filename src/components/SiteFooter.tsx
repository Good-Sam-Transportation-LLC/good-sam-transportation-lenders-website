const SiteFooter = () => (
  <footer className="py-12">
    <div className="container">
      <div className="flex flex-col items-center justify-between gap-4 text-xs text-muted-foreground md:flex-row">
        <p className="font-serif text-sm text-foreground">
          Good Sam <span className="text-primary">Transportation</span>
        </p>
        <p>© {new Date().getFullYear()} Good Sam Transportation. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-primary transition-colors">Privacy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms</a>
          <a href="#" className="hover:text-primary transition-colors">SEC Disclosures</a>
        </div>
      </div>
    </div>
  </footer>
);

export default SiteFooter;
