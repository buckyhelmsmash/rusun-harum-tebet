"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import Script from "next/script";

interface CheckoutButtonProps {
  invoiceId: string;
  amount: number;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  isSandbox?: boolean;
}

interface DuitkuCheckoutOptions {
  successEvent: (result: unknown) => void;
  pendingEvent: (result: unknown) => void;
  errorEvent: (result: unknown) => void;
  closeEvent: (result: unknown) => void;
}

interface DuitkuWindow extends Window {
  checkout: {
    process: (reference: string, options: DuitkuCheckoutOptions) => void;
  };
}

export function CheckoutButton({
  invoiceId,
  amount,
  customerName,
  customerEmail = "penghuni@rusuntebet.id",
  customerPhone = "0800000000",
  isSandbox = true,
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const scriptUrl = isSandbox
    ? "https://app-sandbox.duitku.com/lib/js/duitku.js"
    : "https://app-prod.duitku.com/lib/js/duitku.js";

  const handlePayment = async () => {
    try {
      setIsLoading(true);

      // 1. Request Reference Code from our Backend
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          invoiceId,
          customerName,
          customerEmail,
          customerPhone,
          paymentMethod: "" // Empty string triggers POP selection screen instead of direct API
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal membuat sesi pembayaran");
      }

      const reference = data.data.reference;

      // 2. Trigger Duitku POP UI
      const duitkuWindow = window as unknown as DuitkuWindow;
      
      duitkuWindow.checkout.process(reference, {
        successEvent: (result) => {
          console.log("Success Event:", result);
          toast.success("Pembayaran Berhasil!", {
            description: "Sistem sedang memproses status lunas Anda.",
          });
          // Optional: Force reload to show 'Paid' status
          setTimeout(() => window.location.reload(), 2000);
        },
        pendingEvent: (result) => {
          console.log("Pending Event:", result);
          toast.info("Menunggu Pembayaran", {
            description: "Silakan selesaikan instruksi pembayaran yang diberikan.",
          });
        },
        errorEvent: (result) => {
          console.error("Error Event:", result);
          toast.error("Pembayaran Gagal", {
            description: "Silakan coba metode pembayaran lain.",
          });
        },
        closeEvent: () => {
          console.log("User closed payment window");
          toast("Sesi Pembayaran Ditutup");
        },
      });

    } catch (error) {
      console.error("[CHECKOUT_ERROR]", error);
      toast.error("Terjadi Kesalahan", {
        description: error instanceof Error ? error.message : "Sistem pembayaran Duitku sedang gangguan.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Script src={scriptUrl} strategy="lazyOnload" />
      
      <Button 
        onClick={handlePayment} 
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 rounded-2xl shadow-lg shadow-blue-600/20"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <CreditCard className="mr-2 h-5 w-5" />
        )}
        {isLoading ? "Memproses..." : "Bayar Sekarang"}
      </Button>
    </>
  );
}
