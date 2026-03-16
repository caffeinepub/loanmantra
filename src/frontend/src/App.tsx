import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import WhatsAppFloat from "./components/WhatsAppFloat";
import { AppProvider } from "./context/AppContext";
import Apply from "./pages/Apply";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/apply" element={<Apply />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
        <WhatsAppFloat />
        <Toaster richColors position="top-right" />
      </BrowserRouter>
    </AppProvider>
  );
}
