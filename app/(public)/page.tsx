import type { Metadata } from "next";
import { WartaAbout } from "@/components/landing/warta-about";
import { WartaContact } from "@/components/landing/warta-contact";
import { WartaLeadArticle } from "@/components/landing/warta-lead-article";
import { WartaMap } from "@/components/landing/warta-map";
import { WartaMasthead } from "@/components/landing/warta-masthead";
import { WartaSidebarFeed } from "@/components/landing/warta-sidebar-feed";
import { MOCK_NEWS } from "@/lib/mock-news";

export const metadata: Metadata = {
  title: "Warta Harum | Rusun Harum Tebet",
  description:
    "Portal berita dan informasi resmi warga Rumah Susun Harum Tebet. Berita terkini, pengumuman, dan layanan komunitas.",
  openGraph: {
    title: "Warta Harum | Rusun Harum Tebet",
    description:
      "Portal berita dan informasi resmi warga Rumah Susun Harum Tebet.",
    type: "website",
  },
};

export default function HomePage() {
  const [leadArticle, ...sidebarArticles] = MOCK_NEWS;

  return (
    <main>
      <WartaMasthead />

      <section id="berita" className="section-container pt-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-black border-b border-b-black pt-8">
          <div className="lg:col-span-8 lg:border-r border-neutral-200 lg:pr-10 pb-8">
            <WartaLeadArticle article={leadArticle} index={0} />
          </div>
          <div className="lg:col-span-4 lg:pl-10 pb-8">
            <WartaSidebarFeed articles={sidebarArticles} startIndex={1} />
          </div>
        </div>
      </section>

      <WartaAbout />
      <WartaMap />
      <WartaContact />
    </main>
  );
}
