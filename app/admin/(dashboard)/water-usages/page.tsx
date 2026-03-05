import { WaterUsagesClient } from "@/components/water-usages/water-usages-client";

export const metadata = {
  title: "Penggunaan Air | Rusun Harum Tebet",
  description:
    "Kelola pembacaan meteran air bulanan dan impor data penggunaan.",
};

export default function WaterUsagesPage() {
  return <WaterUsagesClient />;
}
