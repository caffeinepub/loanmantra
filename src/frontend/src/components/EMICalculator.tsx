import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useMemo, useState } from "react";
import { formatINRFull } from "../utils/format";

interface Props {
  cibil?: number;
}

export default function EMICalculator({ cibil = 0 }: Props) {
  const [amount, setAmount] = useState(500000);
  const [rate, setRate] = useState(12);
  const [tenure, setTenure] = useState(36);
  const [fee, setFee] = useState(1.5);
  const [showAmort, setShowAmort] = useState(false);

  const { emi, totalInterest, totalPayable, processingFee, amortization } =
    useMemo(() => {
      const r = rate / 12 / 100;
      const n = tenure;
      const calcEmi =
        r === 0 ? amount / n : (amount * r * (1 + r) ** n) / ((1 + r) ** n - 1);
      const totalPayment = calcEmi * n;
      const calcTotalInterest = totalPayment - amount;
      const calcProcessingFee = (amount * fee) / 100;
      const calcTotalPayable = totalPayment + calcProcessingFee;

      const amortRows: Array<{
        year: number;
        principal: number;
        interest: number;
        balance: number;
      }> = [];
      let balance = amount;
      for (let yr = 1; yr <= Math.ceil(n / 12); yr++) {
        const months = Math.min(12, n - (yr - 1) * 12);
        let yPrincipal = 0;
        let yInterest = 0;
        for (let m = 0; m < months; m++) {
          const intPay = balance * r;
          const prinPay = calcEmi - intPay;
          yInterest += intPay;
          yPrincipal += prinPay;
          balance -= prinPay;
        }
        amortRows.push({
          year: yr,
          principal: yPrincipal,
          interest: yInterest,
          balance: Math.max(0, balance),
        });
      }
      return {
        emi: calcEmi,
        totalInterest: calcTotalInterest,
        totalPayable: calcTotalPayable,
        processingFee: calcProcessingFee,
        amortization: amortRows,
      };
    }, [amount, rate, tenure, fee]);

  const bestMatch =
    cibil >= 750
      ? "HDFC Bank (10% p.a.)"
      : cibil >= 700
        ? "MoneyTap (13% p.a.)"
        : cibil >= 680
          ? "MoneyView (16% p.a.)"
          : null;

  const handlePrint = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>LoanMantra Amortization Table</title></head><body>
      <h2>LoanMantra - Loan Amortization Schedule</h2>
      <p>Loan Amount: ${formatINRFull(amount)} | Rate: ${rate}% p.a. | Tenure: ${tenure} months</p>
      <table border="1" cellpadding="8" style="border-collapse:collapse;width:100%">
        <tr><th>Year</th><th>Principal</th><th>Interest</th><th>Balance</th></tr>
        ${amortization.map((r) => `<tr><td>${r.year}</td><td>${formatINRFull(r.principal)}</td><td>${formatINRFull(r.interest)}</td><td>${formatINRFull(r.balance)}</td></tr>`).join("")}
      </table>
    </body></html>`);
    w.document.close();
    w.print();
  };

  return (
    <div
      id="emi-calculator"
      className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-card"
    >
      <h2 className="text-2xl font-bold mb-6">EMI Calculator</h2>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Loan Amount</span>
              <span className="text-sm font-bold text-primary font-data">
                {formatINRFull(amount)}
              </span>
            </div>
            <Slider
              data-ocid="emi.amount.input"
              min={10000}
              max={5000000}
              step={10000}
              value={[amount]}
              onValueChange={([v]) => setAmount(v)}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>₹10K</span>
              <span>₹50L</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Interest Rate</span>
              <span className="text-sm font-bold text-primary font-data">
                {rate}% p.a.
              </span>
            </div>
            <Slider
              data-ocid="emi.rate.input"
              min={8}
              max={36}
              step={0.5}
              value={[rate]}
              onValueChange={([v]) => setRate(v)}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>8%</span>
              <span>36%</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Tenure</span>
              <span className="text-sm font-bold text-primary font-data">
                {tenure} months ({Math.round((tenure / 12) * 10) / 10} yr)
              </span>
            </div>
            <Slider
              data-ocid="emi.tenure.input"
              min={1}
              max={84}
              step={1}
              value={[tenure]}
              onValueChange={([v]) => setTenure(v)}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>1 mo</span>
              <span>84 mo</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Processing Fee</span>
              <span className="text-sm font-bold text-primary font-data">
                {fee}%
              </span>
            </div>
            <Slider
              data-ocid="emi.fee.input"
              min={0.5}
              max={3}
              step={0.1}
              value={[fee]}
              onValueChange={([v]) => setFee(Number(v.toFixed(1)))}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0.5%</span>
              <span>3%</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl p-5 hero-gradient text-white">
            <div className="text-sm opacity-80 mb-1">Monthly EMI</div>
            <div className="text-4xl font-bold font-data">
              {formatINRFull(Math.round(emi))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Principal", value: formatINRFull(amount) },
              {
                label: "Total Interest",
                value: formatINRFull(Math.round(totalInterest)),
              },
              {
                label: "Processing Fee",
                value: formatINRFull(Math.round(processingFee)),
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg bg-muted p-3 text-center"
              >
                <div className="text-xs text-muted-foreground mb-1">
                  {item.label}
                </div>
                <div className="text-sm font-bold font-data">{item.value}</div>
              </div>
            ))}
          </div>
          <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4">
            <div className="text-sm text-muted-foreground">Total Payable</div>
            <div className="text-2xl font-bold text-primary font-data">
              {formatINRFull(Math.round(totalPayable))}
            </div>
          </div>
          {bestMatch && (
            <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4">
              <div className="text-xs text-green-700 dark:text-green-400 font-semibold mb-1">
                Best EMI Match for your CIBIL
              </div>
              <div className="text-sm font-bold">{bestMatch}</div>
            </div>
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAmort((s) => !s)}
              className="flex items-center gap-1"
            >
              Amortization{" "}
              {showAmort ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
            >
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      {showAmort && (
        <div className="mt-6 overflow-auto animate-fade-in">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Year", "Principal", "Interest", "Balance"].map((h) => (
                  <th
                    key={h}
                    className="text-left py-2 px-3 font-semibold text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {amortization.map((row) => (
                <tr
                  key={row.year}
                  className="border-b border-border/50 hover:bg-muted/50"
                >
                  <td className="py-2 px-3 font-data">Year {row.year}</td>
                  <td className="py-2 px-3 font-data">
                    {formatINRFull(Math.round(row.principal))}
                  </td>
                  <td className="py-2 px-3 font-data">
                    {formatINRFull(Math.round(row.interest))}
                  </td>
                  <td className="py-2 px-3 font-data">
                    {formatINRFull(Math.round(row.balance))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
