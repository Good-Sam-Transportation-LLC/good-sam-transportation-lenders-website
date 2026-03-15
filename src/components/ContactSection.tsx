import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Send, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getSupabaseClient } from "@/integrations/supabase/client";

const ContactSection = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.functions.invoke("send-investor-inquiry", {
        body: {
          full_name: data.get("full_name") as string,
          email: data.get("email") as string,
          firm: (data.get("firm") as string) || null,
          investment_interest: data.get("investment_interest") as string,
          message: (data.get("message") as string) || null,
        },
      });

      if (error) throw error;

      toast({
        title: "Inquiry Received",
        description: "Our investor relations team will respond within 24 hours.",
      });
      form.reset();
    } catch {
      toast({
        title: "Submission Failed",
        description: "Something went wrong. Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="border-b border-border py-24">
      <div className="container">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="mx-auto max-w-3xl"
        >
          <motion.p variants={fadeUp} className="mb-2 text-xs font-medium uppercase tracking-widest text-primary">
            Investor Relations
          </motion.p>
          <motion.h2 variants={fadeUp} className="mb-4 text-3xl md:text-5xl">
            Schedule a Capital Discussion
          </motion.h2>
          <motion.p variants={fadeUp} className="mb-12 text-muted-foreground">
            Request our pitch deck, detailed P&L statements, or schedule a direct call with
            our management team.
          </motion.p>

          <motion.form variants={fadeUp} onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-border bg-card p-6 md:p-8">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name" className="text-xs text-muted-foreground">Full Name</Label>
                <Input id="name" name="full_name" required placeholder="Jane Smith" className="mt-1 bg-secondary border-border" maxLength={200} />
              </div>
              <div>
                <Label htmlFor="email" className="text-xs text-muted-foreground">Email</Label>
                <Input id="email" name="email" type="email" required placeholder="jane@capitalfirm.com" className="mt-1 bg-secondary border-border" maxLength={320} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="firm" className="text-xs text-muted-foreground">Firm / Institution</Label>
                <Input id="firm" name="firm" placeholder="Acme Capital Partners" className="mt-1 bg-secondary border-border" maxLength={200} />
              </div>
              <div>
                <Label htmlFor="investment_interest" className="text-xs text-muted-foreground">Investment Interest</Label>
                <Input
                  id="investment_interest"
                  name="investment_interest"
                  placeholder="e.g. Equity, Debt, Co-investment"
                  className="mt-1 bg-secondary border-border"
                  required
                  maxLength={200}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="message" className="text-xs text-muted-foreground">Message</Label>
              <Textarea
                id="message"
                name="message"
                rows={4}
                placeholder="Tell us about your investment interest..."
                className="mt-1 bg-secondary border-border"
                maxLength={2000}
              />
            </div>

            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground">I'd like to receive:</p>
              <div className="flex flex-wrap gap-6">
                {["Pitch Deck (PDF)", "P&L Statements", "Fleet Valuation Report", "Schedule a Call"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <Checkbox id={item} />
                    <Label htmlFor={item} className="text-sm text-muted-foreground cursor-pointer">{item}</Label>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-sm bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Sending..." : (
                <>
                  <Send size={14} /> Submit Inquiry
                </>
              )}
            </button>

            <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground/60">
              <Shield size={10} />
              Your information is kept strictly confidential.
            </p>
          </motion.form>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
