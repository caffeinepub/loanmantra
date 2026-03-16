import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import {
  Clock,
  MessageCircle,
  Shield,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import EMICalculator from "../components/EMICalculator";
import LendersModal from "../components/LendersModal";
import { createActorWithConfig } from "../config";
import { useApp } from "../context/AppContext";
import { formatINR, getLenderColor, getLenderInitials } from "../utils/format";

const HERO_VARIANTS = {
  A: {
    headline: "Get Loans at 9.99% Interest",
    sub: "Compare rates from 20+ top lenders. Get matched in 60 seconds.",
  },
  B: {
    headline: "CIBIL 680? You're Approved!",
    sub: "Don't let credit score stop you. We have lenders for every profile.",
  },
  C: {
    headline: "\u20b910,000 Instant Approval Today",
    sub: "Fast disbursal loans from India's trusted lenders. Apply in minutes.",
  },
};

const PARTICLES = [
  { id: "coin0", v: "\u20b9" },
  { id: "coin1", v: "\u20b9" },
  { id: "coin2", v: "\u{1FA99}" },
  { id: "coin3", v: "\u{1FA99}" },
  { id: "doc0", v: "\u{1F4C4}" },
  { id: "coin4", v: "\u20b9" },
  { id: "coin5", v: "\u{1FA99}" },
  { id: "bag0", v: "\u{1F4B0}" },
  { id: "coin6", v: "\u20b9" },
  { id: "doc1", v: "\u{1F4C4}" },
];

const TESTIMONIALS = [
  {
    name: "Rohit Kumar",
    city: "India",
    text: "Got my personal loan of \u20b95L in just 2 days! LoanMantra matched me with the perfect lender.",
    cibil: 720,
  },
  {
    name: "Priya Singh",
    city: "India",
    text: "My CIBIL was 690 and I was worried. LoanMantra showed me 8 options instantly!",
    cibil: 690,
  },
  {
    name: "Amit Sharma",
    city: "India",
    text: "Best platform for comparing loans. Got lowest interest rate from HDFC through here.",
    cibil: 760,
  },
];

const FOOTER_QUICK_LINKS = [
  "Personal Loans",
  "Home Loans",
  "Business Loans",
  "Gold Loans",
];
const FOOTER_SUPPORT_LINKS = [
  "Privacy Policy",
  "Terms of Service",
  "Contact Us",
];

export default function Home() {
  const { heroVariant, lendersInitialized, setLendersInitialized } = useApp();
  const [showLenders, setShowLenders] = useState(false);
  const actorRef = useRef<Awaited<
    ReturnType<typeof createActorWithConfig>
  > | null>(null);

  const { data: lenders = [] } = useQuery({
    queryKey: ["lenders"],
    queryFn: async () => {
      if (!actorRef.current) actorRef.current = await createActorWithConfig();
      const a = actorRef.current;
      if (!lendersInitialized) {
        await a.initLenders();
        setLendersInitialized(true);
      }
      return a.getLenders();
    },
  });

  useEffect(() => {
    createActorWithConfig()
      .then((a) => a.recordVariant(heroVariant))
      .catch(() => {});
  }, [heroVariant]);

  const hero = HERO_VARIANTS[heroVariant];
  const featuredLenders = lenders.slice(0, 6);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden hero-gradient text-white py-20 md:py-32">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {PARTICLES.map((p, i) => (
            <span
              key={p.id}
              className="particle"
              style={{
                left: `${8 + i * 9}%`,
                top: `${20 + (i % 4) * 18}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i * 0.4}s`,
                fontSize: `${1.2 + (i % 3) * 0.4}rem`,
              }}
            >
              {p.v}
            </span>
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <Badge className="mb-4 bg-white/20 text-white border-white/30 hover:bg-white/30">
            India&apos;s #1 Loan Aggregator
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            {hero.headline}
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            {hero.sub}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/apply">
              <Button
                size="lg"
                className="btn-gold border-0 font-semibold text-base px-8"
                data-ocid="hero.primary_button"
              >
                Apply Now — Free
              </Button>
            </Link>
            <a href="/#emi-calculator">
              <Button
                size="lg"
                variant="outline"
                className="border-white/50 text-white hover:bg-white/10 bg-transparent text-base px-8"
                data-ocid="hero.secondary_button"
              >
                Check EMI
              </Button>
            </a>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { label: "Lenders", value: "20+" },
              { label: "Disbursed", value: "\u20b9500Cr+" },
              { label: "Customers", value: "50K+" },
              { label: "Min CIBIL", value: "680" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-xl p-4">
                <div className="text-2xl font-bold font-data">{s.value}</div>
                <div className="text-sm text-white/70">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lenders Section */}
      <section id="lenders" className="py-16 container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Top Lenders for You</h2>
            <p className="text-muted-foreground mt-1">
              Compare rates from India&apos;s best banks &amp; NBFCs
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowLenders(true)}
            data-ocid="lenders.open_modal_button"
          >
            View All 20+
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredLenders.map((l, i) => (
            <div
              key={String(l.id)}
              data-ocid={`lenders.item.${i + 1}`}
              className="rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-12 h-12 rounded-xl ${getLenderColor(l.id)} flex items-center justify-center text-white font-bold`}
                >
                  {getLenderInitials(l.name)}
                </div>
                <div>
                  <div className="font-bold">{l.name}</div>
                  <Badge variant="secondary" className="text-xs">
                    {l.category}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-lg bg-primary/5 p-3">
                  <div className="text-xs text-muted-foreground">Rate</div>
                  <div className="font-bold text-primary font-data">
                    {l.interestRate}/mo
                  </div>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <div className="text-xs text-muted-foreground">
                    Max Amount
                  </div>
                  <div className="font-bold font-data">
                    {formatINR(l.maxAmount)}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Link to="/apply" className="flex-1">
                  <Button
                    className="w-full btn-primary-gradient text-white border-0"
                    size="sm"
                  >
                    Apply
                  </Button>
                </Link>
                <a
                  href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hi, I am interested in ${l.name} loan. Please help.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 transition-colors"
                >
                  <MessageCircle size={16} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* EMI Calculator */}
      <section className="py-8 container mx-auto px-4">
        <EMICalculator />
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-muted/40">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose LoanMantra?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Clock,
                title: "Fast Approval",
                desc: "Get loan approval in as little as 2 hours",
              },
              {
                icon: Users,
                title: "20+ Lenders",
                desc: "Compare rates from banks and NBFCs",
              },
              {
                icon: Shield,
                title: "No Hidden Charges",
                desc: "Transparent fees and clear terms",
              },
              {
                icon: TrendingUp,
                title: "Expert Support",
                desc: "Dedicated loan advisors across India",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-card rounded-2xl border border-border p-6 text-center shadow-xs hover:shadow-card transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl btn-primary-gradient flex items-center justify-center mx-auto mb-4">
                  <item.icon size={22} className="text-white" />
                </div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Happy Customers Across India
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="bg-card rounded-2xl border border-border p-6 shadow-xs"
            >
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, j) => (
                  <Star
                    key={`star-${j}-${t.name}`}
                    size={14}
                    className="fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.city}</div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  CIBIL {t.cibil}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="font-bold text-xl text-primary mb-2">
                LoanMantra
              </div>
              <p className="text-sm text-muted-foreground">
                India&apos;s most trusted loan aggregator. Connecting borrowers
                with the best lenders since 2024.
              </p>
              <div className="text-sm text-muted-foreground mt-2">
                📍 Pan India
              </div>
            </div>
            <div>
              <div className="font-semibold mb-3">Quick Links</div>
              <div className="space-y-2 text-sm text-muted-foreground">
                {FOOTER_QUICK_LINKS.map((link) => (
                  <Link
                    key={link}
                    to="/apply"
                    className="block hover:text-primary"
                  >
                    {link}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <div className="font-semibold mb-3">Support</div>
              <div className="space-y-2 text-sm text-muted-foreground">
                {FOOTER_SUPPORT_LINKS.map((link) => (
                  <Link key={link} to="/" className="block hover:text-primary">
                    {link}
                  </Link>
                ))}
                <Link to="/dashboard" className="block hover:text-primary">
                  Admin Dashboard
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-6 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} LoanMantra. All rights reserved. |
            India
          </div>
        </div>
      </footer>

      <LendersModal
        open={showLenders}
        onClose={() => setShowLenders(false)}
        lenders={lenders}
      />
    </div>
  );
}
