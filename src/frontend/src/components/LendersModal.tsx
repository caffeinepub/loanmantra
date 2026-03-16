import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Lender } from "../backend";
import { formatINR, getLenderColor, getLenderInitials } from "../utils/format";

interface Props {
  open: boolean;
  onClose: () => void;
  lenders: Lender[];
  cibil?: number;
  amount?: string;
}

const CATEGORIES = ["All", "Personal", "Business", "Home", "Gold"];

export default function LendersModal({
  open,
  onClose,
  lenders,
  cibil = 700,
  amount = "200000",
}: Props) {
  const [selected, setSelected] = useState<Set<bigint>>(new Set());
  const [comparing, setComparing] = useState(false);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    if (!open) {
      setSelected(new Set());
      setComparing(false);
    }
  }, [open]);

  const filtered =
    activeTab === "All"
      ? lenders
      : lenders.filter((l) => l.category === activeTab);
  const selectedLenders = lenders.filter((l) => selected.has(l.id));

  const toggle = (id: bigint) => {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const waMsg = (name: string) =>
    encodeURIComponent(
      `Hi, I am interested in a ${name} loan for ${formatINR(Number(amount))}. My CIBIL score: ${cibil}`,
    );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-4xl w-full h-[90vh] flex flex-col p-0"
        data-ocid="lenders.modal"
      >
        <DialogHeader className="px-6 pt-6 pb-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">All Lenders</DialogTitle>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1 hover:bg-muted"
              data-ocid="lenders.close_button"
            >
              <X size={20} />
            </button>
          </div>
        </DialogHeader>

        {!comparing ? (
          <>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex-1 flex flex-col min-h-0"
            >
              <TabsList className="mx-6 flex-shrink-0 w-fit">
                {CATEGORIES.map((c) => (
                  <TabsTrigger key={c} value={c}>
                    {c}
                  </TabsTrigger>
                ))}
              </TabsList>
              {CATEGORIES.map((cat) => (
                <TabsContent key={cat} value={cat} className="flex-1 min-h-0">
                  <ScrollArea className="h-full px-6 pb-20">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4">
                      {filtered.map((l, i) => (
                        <button
                          type="button"
                          key={String(l.id)}
                          data-ocid={`lenders.item.${i + 1}`}
                          className={`w-full text-left rounded-xl border-2 p-4 cursor-pointer transition-all ${
                            selected.has(l.id)
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => toggle(l.id)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-lg ${getLenderColor(l.id)} flex items-center justify-center text-white text-xs font-bold`}
                              >
                                {getLenderInitials(l.name)}
                              </div>
                              <div>
                                <div className="font-semibold text-sm">
                                  {l.name}
                                </div>
                                <Badge
                                  variant="secondary"
                                  className="text-xs mt-0.5"
                                >
                                  {l.category}
                                </Badge>
                              </div>
                            </div>
                            <Checkbox
                              checked={selected.has(l.id)}
                              onCheckedChange={() => toggle(l.id)}
                              className="mt-1"
                            />
                          </div>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div className="flex justify-between">
                              <span>Rate</span>
                              <span className="font-semibold text-foreground">
                                {l.interestRate}/mo
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Max Amount</span>
                              <span className="font-semibold text-foreground">
                                {formatINR(l.maxAmount)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Processing Fee</span>
                              <span className="font-semibold text-foreground">
                                {l.processingFee}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <a
                              href={`https://wa.me/919876543210?text=${waMsg(l.name)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                            >
                              <MessageCircle size={12} /> WhatsApp
                            </a>
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>

            {selected.size >= 2 && (
              <div className="flex-shrink-0 px-6 py-4 border-t border-border bg-card">
                <Button
                  type="button"
                  className="btn-primary-gradient text-white border-0"
                  onClick={() => setComparing(true)}
                  data-ocid="lenders.compare_button"
                >
                  Compare {selected.size} Lenders
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-6 py-2 flex items-center gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => setComparing(false)}
                className="text-sm text-primary underline"
              >
                ← Back to list
              </button>
              <span className="text-sm text-muted-foreground">
                Comparing {selectedLenders.length} lenders
              </span>
            </div>
            <ScrollArea className="flex-1 px-6 pb-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feature</TableHead>
                    {selectedLenders.map((l) => (
                      <TableHead key={String(l.id)}>{l.name}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { label: "Category", key: "category" },
                    { label: "Interest Rate", key: "interestRate" },
                    {
                      label: "Max Amount",
                      key: "maxAmount",
                      fmt: (v: bigint) => formatINR(v),
                    },
                    { label: "Processing Fee", key: "processingFee" },
                    {
                      label: "Min CIBIL",
                      key: "minCibil",
                      fmt: (v: bigint) => String(v),
                    },
                  ].map((row) => (
                    <TableRow key={row.label}>
                      <TableCell className="font-medium">{row.label}</TableCell>
                      {selectedLenders.map((l) => (
                        <TableCell key={String(l.id)}>
                          {row.fmt
                            ? row.fmt(l[row.key as keyof Lender] as bigint)
                            : String(l[row.key as keyof Lender])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
