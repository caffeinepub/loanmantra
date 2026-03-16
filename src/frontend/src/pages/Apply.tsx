import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Loader2, MessageCircle } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { Lender } from "../backend";
import { createActorWithConfig } from "../config";
import { useApp } from "../context/AppContext";
import { downloadLeadCSV, saveLeadToLocalStorage } from "../utils/csv";
import { formatINR, getLenderColor, getLenderInitials } from "../utils/format";

const CONFETTI_COLORS = ["#667eea", "#f4c430", "#28a745", "#ff6b6b", "#4ecdc4"];
const CONFETTI_ITEMS = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  color: CONFETTI_COLORS[i % 5],
}));

const BADGE_MAP: Record<string, string[]> = {
  MoneyView: ["Instant Approval"],
  KreditBee: ["Fastest Disbursal"],
  CASHe: ["Instant Approval"],
  "HDFC Bank": ["Lowest Rate", "Bank"],
  "ICICI Bank": ["Lowest Rate", "Bank"],
  "Axis Bank": ["Bank"],
  "Bajaj Finserv": ["Instant Approval"],
};

export default function Apply() {
  const { heroVariant, lendersInitialized, setLendersInitialized } = useApp();
  const navigate = useNavigate();
  const actorRef = useRef<Awaited<
    ReturnType<typeof createActorWithConfig>
  > | null>(null);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    phone: "",
    amount: "200000",
    loanType: "Personal",
    name: "",
    email: "",
    age: "",
    salary: "",
    cibil: 700,
    pan: "",
  });
  const [selectedLenders, setSelectedLenders] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [matchedLenders, setMatchedLenders] = useState<Lender[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const { data: allLenders = [] } = useQuery({
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

  const getActor = async () => {
    if (!actorRef.current) actorRef.current = await createActorWithConfig();
    return actorRef.current;
  };

  const handleNext1 = () => {
    if (!form.phone || form.phone.length < 10) {
      toast.error("Enter a valid 10-digit phone number");
      return;
    }
    if (!form.amount) {
      toast.error("Enter loan amount");
      return;
    }
    setStep(2);
  };

  const handleNext2 = () => {
    if (!form.name) {
      toast.error("Enter your name");
      return;
    }
    setStep(3);
    setAnalyzing(true);
    setTimeout(() => {
      const matched = allLenders.filter(
        (l) => Number(l.minCibil) <= form.cibil,
      );
      setMatchedLenders(matched);
      setAnalyzing(false);
      setAnalyzed(true);
    }, 1800);
  };

  const handleSubmit = async () => {
    if (selectedLenders.length === 0) {
      toast.error("Select at least one lender");
      return;
    }
    setSubmitting(true);
    try {
      const a = await getActor();
      await a.submitLead(
        form.name,
        form.phone,
        form.email,
        form.salary,
        BigInt(form.age || "0"),
        form.pan,
        BigInt(form.cibil),
        BigInt(form.amount || "0"),
        selectedLenders,
        heroVariant,
      );
      const leadData = {
        ...form,
        cibil: String(form.cibil),
        selectedLenders,
        abVariant: heroVariant,
      };
      downloadLeadCSV(leadData);
      saveLeadToLocalStorage(leadData);
      setShowConfetti(true);
      setSuccess(true);
      setTimeout(() => setShowConfetti(false), 2000);
    } catch {
      toast.error("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLender = (name: string) => {
    setSelectedLenders((s) =>
      s.includes(name) ? s.filter((x) => x !== name) : [...s, name],
    );
  };

  const cibilMessage =
    form.cibil >= 750
      ? "\ud83c\udfe6 Perfect score! Bank loans unlocked!"
      : form.cibil >= 700
        ? "\u2705 Good score! Premium NBFCs available."
        : form.cibil >= 680
          ? "\ud83d\udc4d You qualify. NBFCs ready for you."
          : "\u26a0\ufe0f Score below 680. Limited options.";

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center container mx-auto px-4 py-16 relative">
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {CONFETTI_ITEMS.map((item) => (
              <div
                key={item.id}
                className="confetti-piece"
                style={{
                  left: `${(item.id * 3.33) % 100}%`,
                  top: `${(item.id * 1.7) % 50}%`,
                  background: item.color,
                  animationDelay: `${(item.id * 0.05) % 0.5}s`,
                  borderRadius: item.id % 2 === 0 ? "50%" : "0",
                }}
              />
            ))}
          </div>
        )}
        <div className="text-center max-w-md animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-bold mb-3">Application Submitted!</h2>
          <p className="text-muted-foreground mb-2">
            Our team will call you at <strong>{form.phone}</strong> within 2
            hours.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Your application details have been downloaded as CSV.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate("/")} variant="outline">
              Back to Home
            </Button>
            <a
              href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hi, I just applied for a ${form.loanType} loan of ${formatINR(Number(form.amount))}. My CIBIL: ${form.cibil}. Please confirm.`)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-green-600 hover:bg-green-700 text-white border-0">
                <MessageCircle size={16} className="mr-2" /> WhatsApp Us
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <div className="flex justify-between text-sm font-medium mb-2">
          {["Basic Info", "Your Details", "Select Lenders"].map((s, i) => (
            <span
              key={s}
              className={
                step > i + 1
                  ? "text-primary"
                  : step === i + 1
                    ? "text-primary font-bold"
                    : "text-muted-foreground"
              }
            >
              {i + 1}. {s}
            </span>
          ))}
        </div>
        <Progress
          value={step === 1 ? 33 : step === 2 ? 66 : 100}
          className="h-2"
        />
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-card">
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <h2 className="text-2xl font-bold">
              Let&apos;s find your perfect loan
            </h2>
            <p className="text-muted-foreground">
              Quick 3-step process. Takes under 2 minutes.
            </p>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="10-digit mobile number"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                maxLength={10}
                className="mt-1"
                data-ocid="apply.phone.input"
              />
            </div>
            <div>
              <Label htmlFor="amount">Loan Amount (₹) *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="e.g. 200000"
                value={form.amount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, amount: e.target.value }))
                }
                className="mt-1"
                data-ocid="apply.amount.input"
              />
              {form.amount && (
                <p className="text-xs text-muted-foreground mt-1">
                  {formatINR(Number(form.amount))}
                </p>
              )}
            </div>
            <div>
              <Label>Loan Type *</Label>
              <Select
                value={form.loanType}
                onValueChange={(v) => setForm((f) => ({ ...f, loanType: v }))}
              >
                <SelectTrigger
                  className="mt-1"
                  data-ocid="apply.loantype.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Personal", "Home", "Business", "Gold"].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t} Loan
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full btn-primary-gradient text-white border-0"
              onClick={handleNext1}
            >
              Next &rarr;
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <h2 className="text-2xl font-bold">Tell us about yourself</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="mt-1"
                  data-ocid="apply.name.input"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  className="mt-1"
                  data-ocid="apply.email.input"
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="e.g. 28"
                  value={form.age}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, age: e.target.value }))
                  }
                  className="mt-1"
                  data-ocid="apply.age.input"
                />
              </div>
              <div>
                <Label htmlFor="salary">Monthly Salary (₹)</Label>
                <Input
                  id="salary"
                  type="number"
                  placeholder="e.g. 35000"
                  value={form.salary}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, salary: e.target.value }))
                  }
                  className="mt-1"
                  data-ocid="apply.salary.input"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="pan">PAN Number</Label>
                <Input
                  id="pan"
                  placeholder="ABCDE1234F"
                  value={form.pan}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      pan: e.target.value.toUpperCase(),
                    }))
                  }
                  className="mt-1"
                  data-ocid="apply.pan.input"
                  maxLength={10}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <Label>CIBIL Score</Label>
                <span className="text-sm font-bold text-primary font-data">
                  {form.cibil}
                </span>
              </div>
              <Slider
                data-ocid="apply.cibil.input"
                min={300}
                max={900}
                step={10}
                value={[form.cibil]}
                onValueChange={([v]) => setForm((f) => ({ ...f, cibil: v }))}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>300</span>
                <span>900</span>
              </div>
              <div
                className={`mt-2 text-sm font-medium ${
                  form.cibil >= 750
                    ? "text-green-600 dark:text-green-400"
                    : form.cibil >= 700
                      ? "text-blue-600 dark:text-blue-400"
                      : form.cibil >= 680
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-red-600"
                }`}
              >
                {cibilMessage}
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
                data-ocid="apply.back_button"
              >
                ← Back
              </Button>
              <Button
                className="flex-1 btn-primary-gradient text-white border-0"
                onClick={handleNext2}
              >
                Next →
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
            <h2 className="text-2xl font-bold">Select Your Lenders</h2>
            {analyzing && (
              <div className="flex flex-col items-center py-8 gap-4">
                <Loader2 size={40} className="animate-spin text-primary" />
                <p className="font-medium">Analyzing CIBIL {form.cibil}...</p>
                <p className="text-sm text-muted-foreground">
                  Finding best lenders for you
                </p>
              </div>
            )}
            {analyzed && (
              <>
                <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4">
                  <p className="font-semibold text-green-700 dark:text-green-400">
                    \u2705 {matchedLenders.length} lenders matched your{" "}
                    {form.cibil} CIBIL!
                  </p>
                  {form.cibil >= 750 && (
                    <p className="text-sm text-green-600 mt-1">
                      \ud83c\udfe6 Perfect score! Bank loans unlocked!
                    </p>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Select lenders to apply (select at least 1)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {matchedLenders.map((l, i) => {
                    const extraBadges = BADGE_MAP[l.name] || [];
                    return (
                      <button
                        type="button"
                        key={String(l.id)}
                        data-ocid={`apply.lender.item.${i + 1}`}
                        className={`rounded-xl border-2 p-4 cursor-pointer slide-in-up transition-all ${
                          selectedLenders.includes(l.name)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        style={{ animationDelay: `${i * 0.05}s` }}
                        onClick={() => toggleLender(l.name)}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className={`w-9 h-9 rounded-lg ${getLenderColor(l.id)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                          >
                            {getLenderInitials(l.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-sm truncate">
                              {l.name}
                            </div>
                            <div className="text-xs text-primary font-data">
                              {l.interestRate}/mo
                            </div>
                          </div>
                          <Checkbox
                            checked={selectedLenders.includes(l.name)}
                            className="ml-auto flex-shrink-0"
                            onCheckedChange={() => toggleLender(l.name)}
                          />
                        </div>
                        {extraBadges.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {extraBadges.map((b) => (
                              <span
                                key={b}
                                className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium"
                              >
                                {b}
                              </span>
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="flex-1"
                    data-ocid="apply.back_button"
                  >
                    ← Back
                  </Button>
                  <Button
                    className="flex-1 btn-primary-gradient text-white border-0"
                    onClick={handleSubmit}
                    disabled={submitting || selectedLenders.length === 0}
                    data-ocid="apply.submit_button"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
