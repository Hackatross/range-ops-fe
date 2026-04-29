import { LiveSessionView } from "@/components/sessions/live/live-session-view";

export const metadata = {
  title: "Live session · RangeOps",
};

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LiveSessionView sessionId={id} />;
}
