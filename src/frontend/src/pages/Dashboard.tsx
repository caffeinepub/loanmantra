import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle,
  Download,
  IndianRupee,
  LogOut,
  Phone,
  TrendingUp,
  Users,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { CallStatus, type Lead } from "../backend";
import { createActorWithConfig } from "../config";
import { downloadAllLeadsCSV } from "../utils/csv";
import { formatINR } from "../utils/format";

const ADMIN_PASSWORD = "loanmantra2024";
const SKELETON_ROWS = [1, 2, 3, 4, 5];

export default function Dashboard() {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem("lm_admin") === "true",
  );
  const [pw, setPw] = useState("");
  const actorRef = useRef<Awaited<
    ReturnType<typeof createActorWithConfig>
  > | null>(null);
  const qc = useQueryClient();

  const getActor = async () => {
    if (!actorRef.current) actorRef.current = await createActorWithConfig();
    return actorRef.current;
  };

  const handleLogin = () => {
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem("lm_admin", "true");
      setAuthed(true);
    } else {
      toast.error("Incorrect password");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("lm_admin");
    setAuthed(false);
    setPw("");
  };

  const { data: leads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const a = await getActor();
      return a.getLeads();
    },
    enabled: authed,
  });

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const a = await getActor();
      return a.getLeadsStats();
    },
    enabled: authed,
  });

  const { data: variants } = useQuery({
    queryKey: ["variants"],
    queryFn: async () => {
      const a = await getActor();
      return a.getVariantStats();
    },
    enabled: authed,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: bigint; status: CallStatus }) => {
      const a = await getActor();
      await a.updateLeadStatus(id, status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: () => toast.error("Failed to update status"),
  });

  const handleExport = () => {
    const rows = leads.map((l) => ({
      ID: String(l.id),
      Name: l.name,
      Phone: l.phone,
      Email: l.email,
      Salary: l.salary,
      Age: String(l.age),
      PAN: l.pan,
      CIBIL: String(l.cibil),
      LoanAmount: String(l.loanAmount),
      Lenders: l.selectedLenders.join(";"),
      Status: l.callStatus,
      Variant: l.abVariant,
      Timestamp: new Date(Number(l.timestamp) / 1000000).toLocaleString(
        "en-IN",
      ),
    }));
    downloadAllLeadsCSV(rows);
  };

  const handlePwKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  if (!authed) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-full max-w-sm bg-card rounded-2xl border border-border p-8 shadow-card">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-xl btn-primary-gradient flex items-center justify-center mx-auto mb-3">
              <IndianRupee size={24} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold">Admin Dashboard</h2>
            <p className="text-sm text-muted-foreground mt-1">
              LoanMantra Lead Management
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="pw">Admin Password</Label>
              <Input
                id="pw"
                type="password"
                placeholder="Enter password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                onKeyDown={handlePwKeyDown}
                className="mt-1"
              />
            </div>
            <Button
              className="w-full btn-primary-gradient text-white border-0"
              onClick={handleLogin}
            >
              Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const totalLeads = Number(stats?.totalLeads || 0);
  const converted = Number(stats?.convertedCount || 0);
  const revenue = Number(stats?.totalRevenueEstimate || 0);
  const pending = leads.filter(
    (l) => l.callStatus === CallStatus.pending,
  ).length;
  const variantTotal =
    Number(
      (variants?.variantA || 0n) +
        (variants?.variantB || 0n) +
        (variants?.variantC || 0n),
    ) || 1;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Lead Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage all loan applications
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            data-ocid="dashboard.export_button"
          >
            <Download size={16} className="mr-2" /> Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={handleLogout}
            data-ocid="dashboard.logout_button"
            className="text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            <LogOut size={16} className="mr-2" /> Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            icon: Users,
            label: "Total Leads",
            value: totalLeads,
            color: "text-primary",
          },
          {
            icon: CheckCircle,
            label: "Converted",
            value: converted,
            color: "text-green-600",
          },
          {
            icon: IndianRupee,
            label: "Est. Revenue",
            value: formatINR(revenue),
            color: "text-yellow-600",
          },
          {
            icon: Phone,
            label: "Pending Calls",
            value: pending,
            color: "text-orange-600",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-card rounded-xl border border-border p-5 shadow-xs"
          >
            <div className={`${s.color} mb-2`}>
              <s.icon size={20} />
            </div>
            <div className="text-2xl font-bold font-data">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden mb-8">
        <div className="p-5 border-b border-border">
          <h2 className="font-bold text-lg">All Leads</h2>
        </div>
        {leadsLoading ? (
          <div className="p-5 space-y-3">
            {SKELETON_ROWS.map((n) => (
              <Skeleton key={n} className="h-12 w-full" />
            ))}
          </div>
        ) : leads.length === 0 ? (
          <div
            className="p-10 text-center text-muted-foreground"
            data-ocid="dashboard.leads.empty_state"
          >
            No leads yet. Share your LoanMantra link to get started!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>PAN</TableHead>
                  <TableHead>CIBIL</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Lenders</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead: Lead, i: number) => (
                  <TableRow
                    key={String(lead.id)}
                    data-ocid={`dashboard.leads.row.${i + 1}`}
                  >
                    <TableCell className="font-medium">
                      {lead.name || "\u2014"}
                    </TableCell>
                    <TableCell className="font-data">{lead.phone}</TableCell>
                    <TableCell className="text-xs">
                      {lead.email || "\u2014"}
                    </TableCell>
                    <TableCell className="font-data text-xs">
                      {lead.salary ? formatINR(Number(lead.salary)) : "\u2014"}
                    </TableCell>
                    <TableCell className="font-data text-xs">
                      {lead.age ? String(lead.age) : "\u2014"}
                    </TableCell>
                    <TableCell className="font-data text-xs tracking-wider">
                      {lead.pan || "\u2014"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          Number(lead.cibil) >= 750 ? "default" : "secondary"
                        }
                        className="font-data"
                      >
                        {String(lead.cibil)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-data">
                      {formatINR(lead.loanAmount)}
                    </TableCell>
                    <TableCell className="max-w-[140px] truncate text-xs">
                      {lead.selectedLenders.join(", ")}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={lead.callStatus}
                        onValueChange={(v) =>
                          updateStatus.mutate({
                            id: lead.id,
                            status: v as CallStatus,
                          })
                        }
                      >
                        <SelectTrigger
                          className="w-32 h-8"
                          data-ocid={`dashboard.status.select.${i + 1}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(CallStatus).map((s) => (
                            <SelectItem
                              key={s}
                              value={s}
                              className="capitalize"
                            >
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-data">
                      {new Date(
                        Number(lead.timestamp) / 1000000,
                      ).toLocaleDateString("en-IN")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {variants && (
        <div className="bg-card rounded-xl border border-border shadow-xs p-6">
          <h2 className="font-bold text-lg mb-4">A/B Test Performance</h2>
          <div className="space-y-4">
            {[
              {
                label: "Variant A: 9.99% Loans",
                count: Number(variants.variantA),
              },
              {
                label: "Variant B: CIBIL 680 OK",
                count: Number(variants.variantB),
              },
              {
                label: "Variant C: \u20b910K Instant",
                count: Number(variants.variantC),
              },
            ].map((v) => (
              <div key={v.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{v.label}</span>
                  <span className="font-data font-semibold">
                    {v.count} views
                  </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full btn-primary-gradient transition-all"
                    style={{
                      width: `${Math.round((v.count / variantTotal) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
