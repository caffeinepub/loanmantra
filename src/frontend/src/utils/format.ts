export function formatINR(amount: number | bigint): string {
  const n = typeof amount === "bigint" ? Number(amount) : amount;
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

export function formatINRFull(amount: number | bigint): string {
  const n = typeof amount === "bigint" ? Number(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function getLenderInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function getLenderColor(id: number | bigint): string {
  const colors = [
    "bg-violet-600",
    "bg-blue-600",
    "bg-emerald-600",
    "bg-orange-600",
    "bg-rose-600",
    "bg-cyan-600",
    "bg-amber-600",
    "bg-indigo-600",
    "bg-teal-600",
    "bg-pink-600",
  ];
  const n = typeof id === "bigint" ? Number(id) : id;
  return colors[n % colors.length];
}
