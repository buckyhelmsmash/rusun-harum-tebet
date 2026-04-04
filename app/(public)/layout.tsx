import { Inter, Lora, Playfair_Display } from "next/font/google";
import { WartaFooter } from "@/components/landing/warta-footer";
import { WartaHeader } from "@/components/landing/warta-header";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-headline",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-serif-body",
  display: "swap",
});

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`warta ${playfair.variable} ${inter.variable} ${lora.variable}`}
    >
      <WartaHeader />
      {children}
      <WartaFooter />
    </div>
  );
}
