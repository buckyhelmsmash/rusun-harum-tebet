import { UnitDetailClient } from "@/components/units/unit-detail-client";

interface UnitDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function UnitDetailPage({ params }: UnitDetailPageProps) {
  const { id } = await params;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 dark:bg-slate-950/50">
      <UnitDetailClient unitId={id} />
    </div>
  );
}
