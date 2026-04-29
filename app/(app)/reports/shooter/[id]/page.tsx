import { ShooterReportClient } from "@/components/reports/shooter/shooter-report-client";

export const metadata = {
  title: "Shooter report · RangeOps",
};

export default async function ShooterReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="flex-1">
      <ShooterReportClient shooterIdOrCode={id} />
    </div>
  );
}
