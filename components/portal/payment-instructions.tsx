"use client";

import { Check, Copy, Info } from "lucide-react";
import { useState } from "react";

export function PaymentInstructions() {
  const [copied, setCopied] = useState(false);

  const accountNumber = "8290 1234 5678";

  function handleCopy() {
    navigator.clipboard.writeText(accountNumber.replace(/\s/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-3xl p-5 space-y-4">
      <div className="flex items-center gap-2 text-blue-600">
        <Info className="size-5" />
        <h3 className="font-bold text-[13px] uppercase tracking-wider">
          Instruksi Pembayaran
        </h3>
      </div>

      <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
            Nomor Rekening BCA
          </p>
          <p className="text-xl font-bold text-slate-800 tracking-wider">
            {accountNumber}
          </p>
          <p className="text-[11px] text-slate-500 font-bold mt-1 uppercase">
            A/N PPPSRS Rusun Harum Tebet
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="bg-blue-50 text-blue-600 p-2.5 rounded-xl hover:bg-blue-100 transition-colors"
        >
          {copied ? <Check className="size-5" /> : <Copy className="size-5" />}
        </button>
      </div>

      <p className="text-[11px] text-slate-500 leading-relaxed italic">
        * Mohon transfer{" "}
        <span className="font-bold text-blue-600 italic">
          tepat sesuai nominal
        </span>{" "}
        hingga 3 digit terakhir (kode unik) untuk verifikasi otomatis.
      </p>
    </div>
  );
}
