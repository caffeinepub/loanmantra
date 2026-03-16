import { MessageCircle } from "lucide-react";

export default function WhatsAppFloat() {
  return (
    <a
      href="https://wa.me/919876543210?text=Hi%2C%20I%20am%20interested%20in%20a%20loan%20from%20LoanMantra.%20Please%20help%20me."
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float w-14 h-14 rounded-full flex items-center justify-center shadow-lg text-white"
      style={{ background: "#25D366" }}
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={28} fill="white" />
    </a>
  );
}
