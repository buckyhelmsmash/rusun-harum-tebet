"use client";

import { Share2 } from "lucide-react";
import { useCallback } from "react";

interface ShareButtonProps {
  title: string;
  text: string;
}

export function ShareButton({ title, text }: ShareButtonProps) {
  const handleShare = useCallback(async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // User cancelled or share failed, fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      alert("Link berhasil disalin!");
    } catch {
      // Last resort: manual prompt
      prompt("Salin link berikut:", url);
    }
  }, [title, text]);

  return (
    <button
      className="flex items-center gap-2 px-4 py-2.5 border border-black text-[0.7rem] font-black tracking-widest uppercase hover:bg-black hover:text-white transition-all"
      type="button"
      onClick={handleShare}
    >
      <Share2 className="w-4 h-4" />
      Bagikan
    </button>
  );
}
