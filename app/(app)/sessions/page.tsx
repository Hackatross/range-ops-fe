import { SessionsClient } from "@/components/sessions/sessions-client";

export const metadata = {
  title: "Sessions · RangeOps",
  description: "Live shot tracking and session control.",
};

export default function SessionsPage() {
  return (
    <div className="flex-1">
      <SessionsClient />
    </div>
  );
}
