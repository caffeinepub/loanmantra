import { Button } from "@/components/ui/button";
import { IndianRupee, Menu, Moon, Sun, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function Navbar() {
  const { darkMode, toggleDarkMode } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "EMI Calculator", href: "/#emi-calculator" },
    { label: "Lenders", href: "/#lenders" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border shadow-xs">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-xl text-primary"
        >
          <span className="w-8 h-8 rounded-lg btn-primary-gradient flex items-center justify-center text-white">
            <IndianRupee size={16} />
          </span>
          <span>
            Loan
            <span
              className="text-accent-foreground"
              style={{ color: "oklch(0.75 0.18 88)" }}
            >
              Mantra
            </span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === "/" && l.href === "/"
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {l.label}
            </a>
          ))}
          <Link
            to="/dashboard"
            className="text-sm font-medium text-muted-foreground hover:text-primary"
          >
            Dashboard
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            data-ocid="navbar.dark_mode.toggle"
            onClick={toggleDarkMode}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link to="/apply">
            <Button
              size="sm"
              className="btn-primary-gradient text-white border-0 hidden md:inline-flex"
              data-ocid="navbar.apply_button"
            >
              Apply Now
            </Button>
          </Link>
          <button
            type="button"
            className="md:hidden w-9 h-9 flex items-center justify-center"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            data-ocid="navbar.toggle"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-3 flex flex-col gap-3 animate-fade-in">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm font-medium py-1"
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <Link
            to="/dashboard"
            className="text-sm font-medium py-1"
            onClick={() => setMobileOpen(false)}
          >
            Dashboard
          </Link>
          <Link to="/apply" onClick={() => setMobileOpen(false)}>
            <Button className="w-full btn-primary-gradient text-white border-0">
              Apply Now
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
}
