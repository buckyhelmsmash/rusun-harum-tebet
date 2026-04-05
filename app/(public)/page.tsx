import type { Metadata } from "next";
import { WartaAbout } from "@/components/landing/warta-about";
import { WartaContact } from "@/components/landing/warta-contact";
import { WartaLeadArticle } from "@/components/landing/warta-lead-article";
import { WartaMap } from "@/components/landing/warta-map";
import { WartaMasthead } from "@/components/landing/warta-masthead";
import { WartaSidebarFeed } from "@/components/landing/warta-sidebar-feed";
import { newsRepository } from "@/lib/repositories/news";

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

export const revalidate = 60; // revalidate every minute

export default async function HomePage() {
  const [leadArticles, sidebarArticles] = await Promise.all([
    newsRepository.getPublishedLeadNews(),
    newsRepository.getPublishedSidebarNews(5)
  ]);

  const sanitizedLeadArticles = leadArticles.map(doc => ({
    ...doc
  }));

  const sanitizeSideArticles = sidebarArticles.map(doc => ({
    ...doc
  }));

  return (
    <main>
      <WartaMasthead />

      <section id="berita" className="section-container pt-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-black border-b border-b-black pt-8">
          <div className="lg:col-span-8 lg:border-r border-neutral-200 lg:pr-10 pb-8">
            <WartaLeadArticle articles={sanitizedLeadArticles} />
          </div>
          <div className="lg:col-span-4 lg:pl-10 pb-8">
            <WartaSidebarFeed articles={sanitizeSideArticles} startIndex={0} />
          </div>
        </div>
      </section>

      <WartaAbout />
      <WartaMap />
      <WartaContact />
    </main>
  );
}
