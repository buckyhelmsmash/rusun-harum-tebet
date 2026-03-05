import type { Metadata } from "next";
import { InvoicesClient } from "@/components/invoices/invoices-client";

export const metadata: Metadata = {
  title: "Tagihan | Rusun Harum Tebet",
  description: "Manajemen tagihan bulanan",
};

export default function InvoicesPage() {
  return <InvoicesClient />;
}
