export interface LeadFormData {
  name: string;
  phone: string;
  email: string;
  salary: string;
  age: string;
  pan: string;
  cibil: string;
  loanAmount?: string;
  amount?: string;
  loanType: string;
  selectedLenders: string[];
  abVariant: string;
}

export function downloadLeadCSV(lead: LeadFormData) {
  const headers = [
    "Name",
    "Phone",
    "Email",
    "Salary",
    "Age",
    "PAN",
    "CIBIL",
    "LoanAmount",
    "LoanType",
    "Lenders",
    "ABVariant",
    "Timestamp",
  ];
  const row = [
    lead.name,
    lead.phone,
    lead.email,
    lead.salary,
    lead.age,
    lead.pan,
    lead.cibil,
    lead.loanAmount ?? lead.amount ?? "",
    lead.loanType,
    lead.selectedLenders.join(";"),
    lead.abVariant,
    new Date().toISOString(),
  ];
  const csv = [headers, row]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `loanmantra_${lead.phone}_${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function saveLeadToLocalStorage(lead: LeadFormData) {
  const existing = JSON.parse(localStorage.getItem("loanmantra_leads") || "[]");
  existing.push({ ...lead, timestamp: new Date().toISOString() });
  localStorage.setItem("loanmantra_leads", JSON.stringify(existing));
}

export function downloadAllLeadsCSV(leads: Array<Record<string, unknown>>) {
  if (!leads.length) return;
  const headers = Object.keys(leads[0]);
  const rows = leads.map((l) =>
    headers.map((h) => `"${String(l[h] ?? "").replace(/"/g, '""')}"`).join(","),
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `loanmantra_all_leads_${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
