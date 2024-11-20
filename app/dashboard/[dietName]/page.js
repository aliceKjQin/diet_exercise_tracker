import Dashboard from "@/components/dashboard/Dashboard";
import Main from "@/components/sharedUI/Main";

export const metadata = {
  title: "Dashboard ",
  description: "",
};

export default function DashboardPage() {
  return (
    <Main>
      <Dashboard />
    </Main>
  );
}
