import { UnitDetailClient } from "@/components/units/unit-detail-client";

interface UnitDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function UnitDetailPage({ params }: UnitDetailPageProps) {
  const { id } = await params;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <UnitDetailClient unitId={id} />
    </div>
  );
}
