import { motion } from "framer-motion";
import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight, Lock, Loader2 } from "lucide-react";
import { fadeUp } from "@/lib/motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const ContactSection = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    firm: "",
    email: "",
    investment_interest: "Asset-Backed Lending",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-investor-inquiry", {
        body: formData,
      });

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "Inquiry Submitted",
        description: "Our investor relations team will respond within 24 hours.",
      });
    } catch (err) {
      console.error("Submission error:", err);
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="border-t border-border py-24">
      <div className="section-container">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <motion.p {...fadeUp()} className="data-mono text-xs uppercase tracking-[0.2em] text-gold">Investor Relations</motion.p>
            <motion.h2 {...fadeUp(0.05)} className="mt-3 text-3xl font-semibold text-foreground md:text-4xl">Begin the Conversation</motion.h2>
            <motion.p {...fadeUp(0.1)} className="mt-4 max-w-md text-muted-foreground">
              Whether you're exploring asset-backed lending or equity participation, we welcome a confidential discussion about partnership opportunities.
            </motion.p>
            <motion.div {...fadeUp(0.15)} className="mt-8 glass-card p-5">
              <div className="flex items-center gap-3">
                <Lock className="h-4 w-4 text-gold" />
                <span className="text-sm font-medium text-foreground">Secure Data Room Access</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Qualified investors receive access to our Virtual Data Room containing full P&L statements, fleet valuations, and the detailed pitch deck.
              </p>
            </motion.div>
          </div>

          <motion.div {...fadeUp(0.1)}>
            {submitted ? (
              <div className="glass-card-gold flex flex-col items-center justify-center p-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/20">
                  <ArrowRight className="h-5 w-5 text-gold" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">Inquiry Received</h3>
                <p className="mt-2 text-sm text-muted-foreground">Our investor relations team will respond within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="glass-card space-y-4 p-6 md:p-8">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-name" className="mb-1.5 block text-xs font-medium text-muted-foreground">Full Name</label>
                    <input id="contact-name" name="full_name" required type="text" maxLength={100} value={formData.full_name} onChange={handleChange} className="w-full rounded-md border border-border bg-secondary px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-gold/50 focus:ring-1 focus:ring-gold/20" />
                  </div>
                  <div>
                    <label htmlFor="contact-firm" className="mb-1.5 block text-xs font-medium text-muted-foreground">Firm / Organization</label>
                    <input id="contact-firm" name="firm" type="text" maxLength={100} value={formData.firm} onChange={handleChange} className="w-full rounded-md border border-border bg-secondary px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-gold/50 focus:ring-1 focus:ring-gold/20" />
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-email" className="mb-1.5 block text-xs font-medium text-muted-foreground">Email Address</label>
                  <input id="contact-email" name="email" required type="email" maxLength={255} value={formData.email} onChange={handleChange} className="w-full rounded-md border border-border bg-secondary px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-gold/50 focus:ring-1 focus:ring-gold/20" />
                </div>
                <div>
                  <label htmlFor="contact-interest" className="mb-1.5 block text-xs font-medium text-muted-foreground">Investment Interest</label>
                  <select id="contact-interest" name="investment_interest" value={formData.investment_interest} onChange={handleChange} className="w-full rounded-md border border-border bg-secondary px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-gold/50 focus:ring-1 focus:ring-gold/20">
                    <option>Asset-Backed Lending</option>
                    <option>Equity Partnership</option>
                    <option>Convertible Note</option>
                    <option>Other / Exploratory</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="contact-message" className="mb-1.5 block text-xs font-medium text-muted-foreground">Message (Optional)</label>
                  <textarea id="contact-message" name="message" rows={3} maxLength={1000} value={formData.message} onChange={handleChange} className="w-full resize-none rounded-md border border-border bg-secondary px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-gold/50 focus:ring-1 focus:ring-gold/20" />
                </div>
                <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50">
                  {loading ? (
                    <>Submitting… <Loader2 className="h-4 w-4 animate-spin" /></>
                  ) : (
                    <>Submit Inquiry <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>
                <p className="text-center text-[10px] text-muted-foreground">All communications are confidential and NDA-protected upon request.</p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
