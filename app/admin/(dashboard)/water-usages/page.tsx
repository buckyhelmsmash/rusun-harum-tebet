import { WaterUsagesClient } from "@/components/water-usages/water-usages-client";

export const metadata = {
  title: "Water Usages | Rusun Harum Tebet",
  description: "Manage monthly water meter readings and import usage data.",
};

export default function WaterUsagesPage() {
  return <WaterUsagesClient />;
}
