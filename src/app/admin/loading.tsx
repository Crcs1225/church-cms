import { LoadingScreen } from "@/components/ui";

export default function AdminLoading() {
  return (
    <LoadingScreen
      compact
      className="px-6 py-10"
      title="Loading Admin View"
      description="Preparing dashboard data, permissions, and the latest operational records."
    />
  );
}
